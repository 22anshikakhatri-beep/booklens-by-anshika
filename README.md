# Book Burrow

**Live:** [booklens-by-anshika.vercel.app](https://booklens-by-anshika.vercel.app/)

An LLM-powered book recommender for readers who pick books by their back cover. Search by mood, genre, topic, or a book you already loved, and get 6–9 picks, each with a one-line reason it matches.

## Why

Most book discovery runs on ratings and bestseller lists. Readers who choose by mood or by a book they enjoyed have to translate that into keywords. Book Burrow takes the request in plain language and explains each pick.

## How it works

1. The reader picks a mode (topic, genre, description, or similar to a book) and types a query.
2. A Next.js API route sends the query to an LLM through OpenRouter with a strict system prompt: book recommendations only, returned as JSON in a fixed schema (title, author, genre, year, pages, rating, reason).
3. The backend strips reasoning tags and code fences, extracts the JSON, validates each book (title and author required), removes extras beyond 9 and returns clean results to the UI.
4. If the chosen model is unavailable, the request falls back to OpenRouter’s free model router.

## Result

The first version often returned prose, markdown or broken JSON that the UI couldn't show. JSON-only prompting plus backend validation cut failed results from **~33% to under 10%** across ~40 test queries (~95% valid lists, ~15 s median response).

## Stack

Next.js 15 (App Router), TypeScript, Tailwind CSS, OpenRouter (built on DeepSeek R1; now uses OpenRouter's free model router), Vercel

## Run locally

```bash
git clone https://github.com/22anshikakhatri-beep/booklens-by-anshika.git
cd booklens-by-anshika
npm install
cp .env.example .env.local   # add your OpenRouter API key
npm run dev
```

Environment variables:

| Variable | Purpose |
|---|---|
| `OPENROUTER_API_KEY` | Your OpenRouter key ([get one here](https://openrouter.ai/settings/keys)) |
| `OPENROUTER_MODEL` | Model to use (defaults to `openrouter/free`) |
| `SITE_URL` | Sent to OpenRouter as the referrer |

Built by [Anshika Khatri](https://www.linkedin.com/in/anshikakhatri22).
