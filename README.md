# Mail Companion

Mail Companion is a bilingual email dashboard that helps users review messages,
identify high-priority items, translate content and generate concise AI
summaries. It supports Microsoft Outlook through OAuth and NetEase mailboxes
through IMAP, with anonymised sample data available when no mailbox is connected.

**Live application:** https://mail-companion-three.vercel.app

## Features

- Outlook OAuth connection and NetEase IMAP support
- Email priority and category views
- AI-assisted translation and summarisation with Gemini
- Daily summary dashboard for urgent and important messages
- Chinese and English interface
- Responsive React user interface
- Python command-line analysis tool for anonymised email data

## Technology stack

| Area | Technologies |
| --- | --- |
| Frontend | TypeScript, React, Vite, Tailwind CSS, shadcn/ui |
| Backend | JavaScript, Node.js, Express, Vercel serverless functions |
| Integrations | Microsoft OAuth, IMAP, Gemini API |
| Data analysis | Python standard library, JSON, CSV, `unittest` |
| Deployment | Vercel and Railway |

## Python email analyzer

The repository includes a beginner-friendly Python tool in
[`email_analyzer.py`](email_analyzer.py). It reads anonymised email records,
applies transparent keyword rules, and exports classified messages and summary
statistics.

Run it from the repository root:

```bash
python email_analyzer.py sample_emails.json \
  --csv email_report.csv \
  --summary email_summary.json
```

Run the Python tests:

```bash
python -m unittest test_email_analyzer.py -v
```

This module demonstrates variables, functions, lists and dictionaries,
conditional logic, file handling, validation, command-line arguments and unit
testing. The sample dataset is fictional and contains no private email content.

## Run the web application locally

### Requirements

- Node.js 18 or later
- npm

### Installation

```bash
git clone https://github.com/Neiny-18/mail-companion.git
cd mail-companion
npm install
```

Create a `.env` file only if you want to use the external integrations:

```env
GEMINI_API_KEY=your_key
VITE_MS_CLIENT_ID=your_microsoft_client_id
VITE_MS_TENANT_ID=your_microsoft_tenant_id
VITE_BACKEND_BASE_URL=your_backend_url
```

The `.env` file is excluded from Git and must never contain credentials that
are committed to the repository.

Start the frontend:

```bash
npm run dev
```

Run the frontend and local API server together:

```bash
npm run dev:all
```

## Tests and production build

```bash
npm test
npm run build
```

## Deployment overview

- The React frontend and serverless API routes in `api/` can run on Vercel.
- The IMAP backend in `server/index.js` can run on Railway.
- Deployment credentials and API keys should be configured as environment
  variables on the relevant platform.

## Learning context

This is an AI-assisted personal learning project. The project work included
defining product requirements, configuring integrations, testing user flows,
debugging issues and reviewing the implementation. The Python analyzer was
added as a small, transparent module that can be run and explained independently.

## Privacy

Do not commit mailbox passwords, OAuth tokens, API keys or real email content.
Only fictional sample records are included in this repository.
