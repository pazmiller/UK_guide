import { CHATBOT_SYSTEM_PROMPT } from '@/lib/prompts/chatbotSystemPrompt';
import { traceable } from 'langsmith/traceable';

type DeepSeekChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

type DeepSeekMessage = {
  role: 'system' | 'user';
  content: string;
};

type RagJudgeResult = {
  factualCorrectness: number;
  groundedness: number;
  relevance: number;
  hallucinationControl: number;
  explanation: string;
};

function extractDeepSeekText( response: DeepSeekChatResponse )
{
  return response.choices?.[ 0 ]?.message?.content?.trim() ?? '';
}

const DEEPSEEK_TIMEOUT_MS = 20_000;

const requestDeepSeekCompletion = traceable(
  async ( {
    model,
    messages,
    jsonMode = false,
  }: {
    model: string;
    messages: DeepSeekMessage[];
    jsonMode?: boolean;
  } ) =>
  {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if ( !apiKey ) throw new Error( 'DEEPSEEK_API_KEY is not configured.' );

    const controller = new AbortController();
    const timeout = setTimeout( () => controller.abort(), DEEPSEEK_TIMEOUT_MS );

    const response = await fetch( 'https://api.deepseek.com/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify( {
        model,
        messages,
        stream: false,
        ...( jsonMode ? { response_format: { type: 'json_object' } } : {} ),
      } ),
    } ).finally( () => clearTimeout( timeout ) );

    const data = await response.json() as DeepSeekChatResponse;

    if ( !response.ok )
    {
      throw new Error( data.error?.message ?? 'DeepSeek API request failed' );
    }

    return data;
  },
  {
    name: 'DeepSeek chat completion',
    run_type: 'llm',
  },
);

export async function generateRagAnswer( question: string, context: string )
{
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if ( !apiKey ) return null;

  const model = process.env.DEEPSEEK_MODEL ?? 'deepseek-v4-pro';
  const data = await requestDeepSeekCompletion( {
    model,
    messages: [
      {
        role: 'system',
        content: CHATBOT_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: [
          '知识库上下文：',
          context,
          '',
          '用户问题：',
          question,
        ].join( '\n' ),
      },
    ],
  } );

  const answer = extractDeepSeekText( data );
  if ( !answer )
  {
    throw new Error( 'DeepSeek API returned an empty answer' );
  }

  return answer;
}

function boundedScore( value: unknown, maximum: number )
{
  if ( typeof value !== 'number' || !Number.isFinite( value ) )
  {
    throw new Error( 'DeepSeek judge returned an invalid score.' );
  }

  return Math.max( 0, Math.min( maximum, value ) );
}

export async function judgeRagAnswer( input: {
  question: string;
  referenceAnswer: string;
  answer: string;
  context: string;
} ): Promise<RagJudgeResult>
{
  const model = process.env.DEEPSEEK_JUDGE_MODEL ?? 'deepseek-v4-pro';
  const data = await requestDeepSeekCompletion( {
    model,
    jsonMode: true,
    messages: [
      {
        role: 'system',
        content: [
          '你是独立的 RAG 质量评审，不是回答问题的助手。',
          '只依据给定问题、参考答案和检索上下文评分。',
          '输出 JSON，不要 markdown。字段必须是：',
          'factualCorrectness（0-35）、groundedness（0-30）、relevance（0-20）、hallucinationControl（0-15）、explanation（简短中文说明）。',
          '总分越高越好。没有依据的具体事实、价格、地址或推荐必须扣分。',
        ].join( '\n' ),
      },
      {
        role: 'user',
        content: [
          `问题：${input.question}`,
          `参考答案：${input.referenceAnswer}`,
          `实际回答：${input.answer}`,
          '检索上下文：',
          input.context,
        ].join( '\n\n' ),
      },
    ],
  } );

  const content = extractDeepSeekText( data );
  if ( !content ) throw new Error( 'DeepSeek judge returned an empty response.' );

  let parsed: Record<string, unknown>;
  try
  {
    parsed = JSON.parse( content ) as Record<string, unknown>;
  } catch
  {
    throw new Error( 'DeepSeek judge returned invalid JSON.' );
  }

  return {
    factualCorrectness: boundedScore( parsed.factualCorrectness, 35 ),
    groundedness: boundedScore( parsed.groundedness, 30 ),
    relevance: boundedScore( parsed.relevance, 20 ),
    hallucinationControl: boundedScore( parsed.hallucinationControl, 15 ),
    explanation: typeof parsed.explanation === 'string' ? parsed.explanation.slice( 0, 500 ) : '',
  };
}
