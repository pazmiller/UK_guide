# Project Structure
This is a Next.js project.
It has both frontend code and backend API code.

## Frontend
Frontend files show the website in the browser.

Common frontend places:
- `app/**/page.tsx`
- `components/*.tsx`

Files with this line run in the browser:

```ts
'use client';
```

These files can use:
- `useState`
- `useEffect`
- `onClick`
- `window`
- `document`

Do not put secret keys in frontend files.

## Backend
Backend API files run on the server.

Backend API files live here:
- `app/api/**/route.ts`

Current backend API:
- `app/api/chat/route.ts`

This file receives chatbot questions, searches the RAG knowledge base, calls the LLM, and returns JSON.
Secret keys can only be used in backend files.

Example:
```ts
process.env.DEEPSEEK_API_KEY
```

## Shared Code
Shared helper code lives here:

- `lib/`
Current shared RAG helper:

- `lib/ragKnowledge.ts`
This file searches the knowledge base and builds context for the chatbot.
Do not put secret keys in shared code unless the file is clearly server-only.

Current chatbot prompt template:

- `lib/prompts/chatbotSystemPrompt.ts`

Edit this file to change the chatbot answer rules and format.

## Server-Only Helpers
Server-only helper code lives here:

- `lib/server/`

Current server-only helper:

- `lib/server/deepseekChat.ts`

Only backend files should import files from `lib/server/`.
Frontend files in `components/` should not import from `lib/server/`.

## Data

Human-editable source data lives here:
- `info_datasource/DATA.md`

Generated app data lives here:
- `data/rag-knowledge-base.json`

Do not edit `data/rag-knowledge-base.json` by hand.
Edit `info_datasource/DATA.md`, then run:

```bash
npm run build:rag
```

## Scripts

Scripts live here:
- `scripts/`

Current script:
- `scripts/build-rag-kb.mjs`

This script turns `DATA.md` into `rag-knowledge-base.json`.

## Important Commands

Run lint:

```bash
npm run lint
```

Run TypeScript check:

```bash
npx tsc --noEmit --pretty false
```

Build the site:

```bash
npm run build
```

Rebuild the RAG knowledge base:

```bash
npm run build:rag
```

## Simple Rule
- `components/` is mostly frontend.
- `app/api/` is backend.
- `lib/` is shared helper code.
- `lib/server/` is server-only helper code.
- `data/` is app data.
- `scripts/` is developer tooling.
