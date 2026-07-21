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

## 5.1 LangSmith tracing

The server-only orchestration file is:

- `lib/server/ragChat.ts`

When the following environment variables are configured, every valid chat request is traced as one RAG chain:

```bash
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=your_langsmith_api_key_here
LANGSMITH_PROJECT=uk-website-rag-dev
```

The trace contains:

- the top-level RAG chat chain;
- the retrieved chunks as a retriever span;
- the DeepSeek chat completion as an LLM span;
- the returned answer mode and retrieved chunk IDs.

Do not put LangSmith credentials in frontend files. Questions, retrieved content, prompts, and model responses can be included in traces, so do not add user identifiers, IP addresses, cookies, or other sensitive data to tracing inputs or metadata.

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

Edit the human-readable source:

- `src/DATA.md`

Then run:

```bash
npm run build:data
npm run build:rag
```

This generates the machine-readable source and then updates the RAG index:

- `src/DATA.json`
- `data/rag-knowledge-base.json`

## Retrieval regression checks

Run the retrieval regression cases against the real knowledge base with:

```bash
npm run eval:rag
```

Add a case in `scripts/evaluate-rag.mts` whenever a retrieval bug is fixed, a new city is added, or an important alias is introduced.

## LangSmith evaluation dataset

The source of truth for the 20 real travel questions is:

- `evals/ragDataset.ts`

After configuring `LANGSMITH_API_KEY`, create or update the cloud dataset with:

```bash
npm run langsmith:sync-rag-dataset
```

The script creates the `uk-website-rag-v1` dataset if needed, then upserts all examples using their stable case IDs. Each example has a user question, a reference answer, expected source titles, a scenario label, and the `test` split.

Run a LangSmith Experiment against the full dataset with:

```bash
npm run langsmith:eval-rag
```

This command requires both `LANGSMITH_API_KEY` and `DEEPSEEK_API_KEY`. It invokes DeepSeek once per example and creates a new experiment with three deterministic scores: expected-source recall, whether the answer names the expected source, and whether the LLM returned an answer instead of falling back locally. The final output includes the experiment URL.
