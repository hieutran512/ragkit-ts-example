# Example project demonstrating RagKit usage in a TypeScript codebase.

A simple TypeScript RAG app that:

- indexes a small example codebase with `ragkit-ts`
- answers questions over retrieved chunks
- runs a QA benchmark to qualify retrieval quality

## 1) Install

```bash
npm install
```

## 2) Configure embeddings

Copy `.env.example` to `.env` and choose one provider:

- Ollama (`OLLAMA_BASE_URL`, `OLLAMA_MODEL`)
- OpenAI-compatible endpoint (`OPENAI_COMPATIBLE_BASE_URL`, `OPENAI_COMPATIBLE_MODEL`)

## 3) Run the app

```bash
npm run dev
```

Open http://localhost:3000 and:

1. Click **Build Index**
2. Ask questions
3. Click **Run QA Eval**

## CLI helpers

```bash
npm run index
npm run index -- --force
npm run eval
```

## Benchmark scoring

The QA runner computes:

- `retrievalHitRate`: expected file appears in top matches
- `averageKeywordRecall`: expected keywords found in retrieved context
- `passRate`: per-case pass using file hit + keyword recall threshold

Update questions in `data/qa-set.json` and expand files in `sample-codebase/` to model your real quality bar.
