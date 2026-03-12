# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Outlook connection (optional)**

The app uses `window.location.origin + '/settings'` as the OAuth redirect URI, so it works on any port (8080, 8081, etc.). In your Azure App Registration, add all redirect URIs you use, e.g.:
- `http://localhost:8080/settings`
- `http://localhost:8081/settings`

Set `VITE_MS_CLIENT_ID` and `VITE_MS_TENANT_ID` in `.env`. No `VITE_MS_REDIRECT_URI` needed.

**AI translation & summary (optional)**

To use the in-app translation and AI summary features:

1. In the project root, create or edit `.env` and add `GEMINI_API_KEY=your_key` (or `GOOGLE_API_KEY`)
2. Stop any old API server: `npm run server:kill`
3. Start the API server: `npm run server` (or run both frontend + API with `npm run dev:all`)
4. Verify: open `http://localhost:8080` and check browser console for `[api/health] { ok: true, hasGeminiKey: true, ... }`

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

**Vercel (frontend)**

Connect your repo to Vercel. Add env vars: `GEMINI_API_KEY`, `VITE_MS_CLIENT_ID`, `VITE_MS_TENANT_ID`, `VITE_BACKEND_BASE_URL` (Railway backend URL for NetEase, e.g. `https://mail-companion-production.up.railway.app`).

**Railway (backend for NetEase IMAP)**

The backend in `server/index.js` runs on Railway for IMAP (NetEase).

**Deploy steps**

1. Create a project at [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select this repo. Railway auto-detects Node and runs `npm start`
3. In Railway → Variables, add:
   - `CORS_ORIGINS` – e.g. `https://your-app.vercel.app,http://localhost:8080`
4. Deploy. Railway gives a URL like `https://xxx.up.railway.app`
5. Test: `curl https://xxx.up.railway.app/health` → `{"ok":true,"runtime":"railway"}`

**Required env vars (Railway)**

| Variable       | Required | Example                                                |
|----------------|----------|--------------------------------------------------------|
| `CORS_ORIGINS` | Yes      | `https://mail-companion.vercel.app,http://localhost:8080` |

**Local run**

```sh
npm start
# or
npm run server
```

**Local development**

- `npm run dev:all` – frontend + backend
- `npm run server` or `npm start` – backend only
- `npm run dev` – frontend only

**Lovable**

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
