'use client';

import { FormEvent, useRef, useState } from 'react';
import { Bot, Loader2, MessageCircle, Send, X } from 'lucide-react';

type ChatSource = {
  id: string;
  title: string;
  city: string;
  category: string;
  source: string;
  score: number;
};

type ChatMessage = {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  sources?: ChatSource[];
  mode?: string;
};

type ChatResponse = {
  answer?: string;
  sources?: ChatSource[];
  mode?: string;
  error?: string;
  warning?: string;
};

const EXAMPLE_QUESTIONS = [
  '伦敦有什么好吃的？',
  '约克有什么推荐？',
  '伦敦有什么避雷？',
];

export default function Chatbot()
{
  const [ isOpen, setIsOpen ] = useState( false );
  const [ input, setInput ] = useState( '' );
  const [ isLoading, setIsLoading ] = useState( false );
  const [ messages, setMessages ] = useState<ChatMessage[]>( [
    {
      id: 1,
      role: 'assistant',
      content: '你好！可以问我伦敦、约克、欧洲城市的餐厅、景点和避雷。',
    },
  ] );
  const nextIdRef = useRef( 2 );

  async function askQuestion( question: string )
  {
    const trimmed = question.trim();
    if ( !trimmed || isLoading ) return;

    const userMessage: ChatMessage = {
      id: nextIdRef.current++,
      role: 'user',
      content: trimmed,
    };

    setMessages( previous => [ ...previous, userMessage ] );
    setInput( '' );
    setIsLoading( true );

    try
    {
      const response = await fetch( '/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify( { question: trimmed } ),
      } );

      const data = await response.json() as ChatResponse;

      if ( !response.ok || data.error )
      {
        throw new Error( data.error ?? 'Chat request failed' );
      }

      const assistantMessage: ChatMessage = {
        id: nextIdRef.current++,
        role: 'assistant',
        content: data.answer ?? '目前没有生成回答。',
        sources: data.sources ?? [],
        mode: data.mode,
      };

      setMessages( previous => [ ...previous, assistantMessage ] );
    } catch ( error )
    {
      const message = error instanceof Error ? error.message : 'Unknown chat error';
      setMessages( previous => [
        ...previous,
        {
          id: nextIdRef.current++,
          role: 'assistant',
          content: `请求失败：${message}`,
        },
      ] );
    } finally
    {
      setIsLoading( false );
    }
  }

  function handleSubmit( event: FormEvent<HTMLFormElement> )
  {
    event.preventDefault();
    void askQuestion( input );
  }

  return (
    <div className="fixed bottom-5 right-5 z-[9998]">
      {isOpen && (
        <div className="mb-3 flex h-[620px] max-h-[calc(100vh-120px)] w-[min(420px,calc(100vw-40px))] flex-col overflow-hidden rounded-lg border border-[#1D3557]/10 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-[#1D3557] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#E63946]">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-bold">UKCFFA Guide</div>
                <div className="text-xs text-white/60">RAG chatbot</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen( false )}
              className="rounded-md p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close chatbot"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-[#FBF8F1] p-4">
            {messages.map( message => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    message.role === 'user'
                      ? 'bg-[#E63946] text-white'
                      : 'bg-white text-[#1D3557] ring-1 ring-[#1D3557]/10'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 border-t border-[#1D3557]/10 pt-2">
                      <div className="mb-1 text-xs font-semibold text-[#1D3557]/60">
                        Sources
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {message.sources.slice( 0, 4 ).map( source => (
                          <span
                            key={source.id}
                            className="rounded-md bg-[#F1FAEE] px-2 py-1 text-xs text-[#1D3557]/75"
                          >
                            {source.city} · {source.title}
                          </span>
                        ) )}
                      </div>
                    </div>
                  )}
                  {message.mode === 'local-fallback' && (
                    <div className="mt-2 text-xs text-[#1D3557]/45">
                      local fallback
                    </div>
                  )}
                </div>
              </div>
            ) )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm text-[#1D3557]/60 shadow-sm ring-1 ring-[#1D3557]/10">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  汉弗莱爵士帮你出谋划策中...
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-[#1D3557]/10 bg-white p-3">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {EXAMPLE_QUESTIONS.map( question => (
                <button
                  key={question}
                  type="button"
                  onClick={() => void askQuestion( question )}
                  className="rounded-md bg-[#F1FAEE] px-2 py-1 text-xs text-[#1D3557]/70 transition-colors hover:bg-[#E63946] hover:text-white"
                  disabled={isLoading}
                >
                  {question}
                </button>
              ) )}
            </div>
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                value={input}
                onChange={event => setInput( event.target.value )}
                placeholder="问伦敦、约克有什么好吃好玩..."
                className="min-w-0 flex-1 rounded-lg border border-[#1D3557]/15 px-3 py-2 text-sm text-[#1D3557] outline-none transition-colors placeholder:text-[#1D3557]/35 focus:border-[#E63946]"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={isLoading || input.trim().length === 0}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E63946] text-white transition-colors hover:bg-[#c1121f] disabled:cursor-not-allowed disabled:bg-gray-300"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen( previous => !previous )}
        className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#E63946] text-white shadow-xl transition-transform hover:-translate-y-0.5 hover:bg-[#c1121f]"
        aria-label="Open chatbot"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
