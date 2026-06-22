# Chatbot RAG Flow

This is the chatbot pipeline in this project.

## 1. User asks a question

The frontend file is:

- `components/Chatbot.tsx`

It sends a request:

```ts
fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ question })
});
```

The frontend does not call DeepSeek directly.

The frontend does not know the API key.

## 2. Backend receives the question

The backend file is:

- `app/api/chat/route.ts`

It reads:

```ts
question
```

Then it checks:

- question exists
- question is not too long

## 3. Backend searches the knowledge base

The RAG helper file is:

- `lib/ragKnowledge.ts`

The backend calls:

```ts
buildRagContext(question)
```

This returns:

- `context`
- `chunks`

`context` is sent to the LLM.

`chunks` become sources for the UI.

## 4. Backend calls the LLM

The server-only DeepSeek file is:

- `lib/server/deepseekChat.ts`

The system prompt template is:

- `lib/prompts/chatbotSystemPrompt.ts`

Edit this file to change the answer style and format.

It reads:

```ts
process.env.DEEPSEEK_API_KEY
```

Only server code can read this.

Never put this key in frontend code.

## 5. Backend returns the answer

The API returns:

```ts
{
  answer,
  sources,
  mode
}
```

`mode` can be:

- `llm`
- `local-fallback`

`local-fallback` means the app used RAG chunks without an LLM answer.

## 6. Frontend shows the answer

`components/Chatbot.tsx` displays:

- user message
- assistant answer
- source chips

## Simple Mental Model

```text
Chatbot UI
  -> /api/chat
  -> buildRagContext()
  -> DeepSeek
  -> answer + sources
  -> Chatbot UI
```

## How To Rebuild The Knowledge Base

Edit:

- `info_datasource/DATA.md`

Then run:

```bash
npm run build:rag
```

This updates:

- `data/rag-knowledge-base.json`
