# Startup Reviver

A minimal Next.js application for prompting the V0 Platform to build a project and deploying the generated version to Vercel. Everything needed to create → deploy → grab the URL lives in this repo; no dependency on the legacy `vibehacker` project.

## Requirements
- Node.js 18.18+ (or the current LTS)
- V0 Platform API key with the Vercel integration authorized

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the example environment file and provide your key:
   ```bash
   cp .env.local.example .env.local
   # edit .env.local and paste your V0 API key
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000 to access the UI.

## Usage
- Enter a prompt in the form and click **Generate with V0**. The app calls `POST /api/generate`, which wraps `v0.chats.create` (or `sendMessage` if you later supply a `chatId`).
- Once generation finishes, the UI captures the `projectId`, `chatId`, and `latestVersion.id`.
- Click **Deploy latest version** to invoke `POST /api/deployments`. The route calls `v0.deployments.create` and automatically provisions the backing Vercel project if it does not exist.
- The UI surfaces the live deployment URL and the Vercel inspector link. Preview deployments may return HTTP 401 until you authenticate in Vercel or configure a bypass token.
- Prefer the single-call `POST /api/autodeploy` if you want the server to handle generation and deployment in one request (see docs/autodeploy-api.md for details).

Both API routes perform basic validation and bubble up V0/Vercel errors so they are easy to debug.

## API Reference
- `POST /api/generate` – Body accepts `message` (string) plus optional `chatId`, `projectId`, `modelId`, `imageGenerations`, `thinking`, and `attachments`. Responds with the V0 `ChatDetail`.
- `POST /api/deployments` – Body requires `projectId`, `chatId`, `versionId`. Responds with the V0 deployment object, including `webUrl` and `inspectorUrl`.
- `POST /api/autodeploy` – Body requires `message` and optionally mirrors the fields from `/api/generate` plus timeout overrides. Responds with deployment metadata (`webUrl`, `deploymentId`, etc.) after generation and deployment complete.

## Scripts
- `npm run dev` – Start the Next.js dev server
- `npm run build` – Build for production
- `npm run start` – Start the production server
- `npm run lint` – Run ESLint

See `flow.md` for a command-line walkthrough of the same prompt → deploy workflow.
