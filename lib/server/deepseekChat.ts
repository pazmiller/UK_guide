import { CHATBOT_SYSTEM_PROMPT } from '@/lib/prompts/chatbotSystemPrompt';

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

function extractDeepSeekText( response: DeepSeekChatResponse )
{
  return response.choices?.[ 0 ]?.message?.content?.trim() ?? '';
}

const DEEPSEEK_TIMEOUT_MS = 20_000;

export async function generateRagAnswer( question: string, context: string )
{
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if ( !apiKey ) return null;

  const model = process.env.DEEPSEEK_MODEL ?? 'deepseek-v4-pro';
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
      stream: false,
    } ),
  } ).finally( () => clearTimeout( timeout ) );

  const data = await response.json() as DeepSeekChatResponse;

  if ( !response.ok )
  {
    throw new Error( data.error?.message ?? 'DeepSeek API request failed' );
  }

  const answer = extractDeepSeekText( data );
  if ( !answer )
  {
    throw new Error( 'DeepSeek API returned an empty answer' );
  }

  return answer;
}
