# Prompt-to-Deploy Flow

High-level recipe for going from an AI prompt to a Vercel deployment using the local API routes.

## Option A — Autonomous flow via `/api/autodeploy`
Send one request and receive the deployed URL (plus identifiers) in the response.

```bash
curl -X POST http://localhost:3000/api/autodeploy \
  -H 'Content-Type: application/json' \
  -d '{
    "message": "Create a minimal hello world page with a large heading.",
    "modelId": "v0-1.5-md"
  }'
```

### Response highlights
- `projectId`, `chatId`, `versionId` for auditing or further actions
- `deploymentId`, `webUrl`, `inspectorUrl`
- Optional `previewUrl` (V0 demo) and `message` (deployment status text)

If the Vercel project does not exist yet, the server-side flow provisions it before retrying the deployment. The default timeouts allow roughly two minutes for generation, waiting on the final version, and deployment.

## Prerequisites
- Next.js dev server (`npm run dev`) running on `http://localhost:3000`
- `V0_API_KEY` configured in `.env.local` and valid for the V0 Platform + Vercel integration
- (Optional) authenticated Vercel session if the deployment uses preview protection

## Option B — Manual two-step flow

### 1. Generate an app via `/api/generate`
Send a POST request with the desired prompt (feel free to change the wording or include attachments/model options).

```bash
curl -X POST http://localhost:3000/api/generate \
  -H 'Content-Type: application/json' \
  -d '{
    "message": "Create a minimal hello world page with a large heading.",
    "modelId": "v0-1.5-md"
  }'
```

#### What to look for in the response
The JSON payload mirrors the V0 `ChatDetail`. Grab these identifiers for later steps:
- `projectId`
- `id` (this is the `chatId`)
- `latestVersion.id` (this is the `versionId` you will deploy)

Save them somewhere convenient (e.g. export as shell variables).

### 2. Trigger a deployment via `/api/deployments`
Use the values from step 1. The deploy route automatically creates the backing Vercel project if needed.

```bash
curl -X POST http://localhost:3000/api/deployments \
  -H 'Content-Type: application/json' \
  -d "{
    \"projectId\": \"<PROJECT_ID>\",
    \"chatId\": \"<CHAT_ID>\",
    \"versionId\": \"<VERSION_ID>\"
  }"
```

#### Expected response
- `id`: deployment identifier on the V0 side  
- `inspectorUrl`: Vercel dashboard link for the deployment  
- `webUrl`: live site URL

If the response indicates missing Vercel integration, authorize the integration in the V0 dashboard and retry.

### 3. Verify the deployment
Visit the `webUrl` in a browser or curl it:

```bash
curl -I https://<DEPLOYMENT_URL>
```

- Status `200` (or a Vercel preview `401` that clears once logged in) confirms the deployment is reachable.
- Use the `inspectorUrl` for logs, rollbacks, or environment tweaks.

### Troubleshooting tips
- `401` responses from the API usually mean the `V0_API_KEY` is missing or invalid.
- Deployment failures bubble up the message from V0; retry after fixing the underlying issue (e.g. missing Vercel integration).
