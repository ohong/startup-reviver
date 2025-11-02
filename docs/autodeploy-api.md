# `/api/autodeploy`

Single-call endpoint that generates a V0 project from a prompt, waits for the resulting version to finish, deploys it to Vercel, and returns the live URL.

## Request

```
POST /api/autodeploy
Content-Type: application/json
```

### Body

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `message` | string | ✅ | Prompt sent to V0. |
| `projectId` | string | optional | Attach the generation to an existing V0 project. If omitted, V0 creates a new project. |
| `chatId` | string | optional | Continue an existing chat instead of starting a new one. |
| `modelId` | string | optional | Defaults to `v0-1.5-md`. |
| `imageGenerations` | boolean | optional | Enable image generation for the run. |
| `thinking` | boolean | optional | Enable the model “thinking” capability. |
| `attachments` | array | optional | Pass-through attachments supported by the V0 API. |
| `generationTimeoutMs` | number | optional | Max time to wait for the initial V0 response (default: 120 000 ms). |
| `versionPollIntervalMs` | number | optional | Interval between status polls while waiting for the version to complete (default: 2 000 ms). |
| `versionMaxWaitMs` | number | optional | Total time allotted for the version to reach `completed` status (default: 120 000 ms). |
| `deploymentTimeoutMs` | number | optional | Max time to wait for deployment to finish (default: 120 000 ms). |

## Response

Success (`200 OK`):

```json
{
  "projectId": "proj_123",
  "chatId": "chat_123",
  "versionId": "ver_123",
  "deploymentId": "dpl_123",
  "webUrl": "https://example.vercel.app",
  "inspectorUrl": "https://vercel.com/org/project/dpl_123",
  "previewUrl": "https://demo.vusercontent.net",
  "chatUrl": "https://v0.dev/chat/chat_123",
  "message": "Deployment completed successfully"
}
```

## Failure Handling

- Missing API key → `401` with `{ "error": "API_KEY_MISSING", ... }`
- Invalid payload → `400`
- Generation timeout → `504` with error code `TIMEOUT` / `VERSION_TIMEOUT`
- Deployment issues → `500` with message from V0; the endpoint automatically provisions the Vercel project once if the first attempt fails with “Project has no Vercel project ID”.

Any error response also includes a descriptive `message` (and `details` where helpful) to aid debugging.

## How it works

1. Validates input and ensures `V0_API_KEY` is configured server-side.
2. Calls `v0.chats.create`/`sendMessage` with `responseMode: 'sync'`.
3. Polls `v0.chats.getById` until the latest version reaches `completed` (or the timeout expires).
4. Calls `v0.deployments.create` and, if necessary, provisions the required Vercel project before retrying.
5. Returns deployment metadata once V0 confirms success.
