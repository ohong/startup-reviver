LiveKit Outbound Calls

Overview
- This feature initiates an outbound PSTN call via LiveKit SIP, bridges the callee into a LiveKit room, and (optionally) dispatches a pre-configured Agent to ask predefined questions.

Environment Variables
- `LIVEKIT_URL` — your LiveKit Cloud URL, e.g. `https://<project>.livekit.cloud`
- `LIVEKIT_API_KEY` — LiveKit API key with SIP + room permissions
- `LIVEKIT_API_SECRET` — LiveKit API secret
- `LIVEKIT_SIP_OUTBOUND_TRUNK_ID` — the Outbound Trunk ID to use for dialing
- `LIVEKIT_SIP_FROM_NUMBER` — optional caller ID number to present
- `LIVEKIT_AGENT_NAME` — optional Agent name to auto-dispatch into the room (must exist in your LiveKit project)

API
- Route: `POST /api/calls/outbound`
- Body:
  - `to` (string, required): E.164 number, e.g. `+15551230000`
  - `fromNumber` (string, optional): overrides `LIVEKIT_SIP_FROM_NUMBER`
  - `roomName` (string, optional): custom room name (auto-generated if omitted)
  - `questions` (string[], optional): predefined questions to ask
  - `agentName` (string, optional): overrides `LIVEKIT_AGENT_NAME`
  - `waitUntilAnswered` (boolean, optional): default `true`
  - `recipientName` (string, optional): callee name, included in metadata as `recipient_name`
  - `rowIndex` (number, optional): 1-based row index for CSV workflows, included as `row_index`

Response
- `{ roomName: string, participant: SIPParticipantInfo, metadata: {...} }`

How questions get asked
- If `LIVEKIT_AGENT_NAME` (or `agentName` in request) is set, the room is created with an Agent dispatch whose `metadata` contains `{ questions, question, phone_number, recipient_name, row_index }`.
- You must configure the named Agent in LiveKit to read room or dispatch metadata and drive TTS/STT for the interview flow.
- As a simple starting point, encode logic to:
  1) Announce the purpose; 2) Ask each question; 3) Transcribe and store answers; 4) Post results to your system (webhook or email).

Local test example
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{
    "to": "+15551230000",
    "recipientName": "Jane Doe",
    "rowIndex": 12,
    "questions": [
      "What is your first and last name?",
      "What is your company name?",
      "Do you prefer a morning or afternoon meeting?"
    ]
  }' \
  http://localhost:3000/api/calls/outbound

Notes
- The room is created with short timeouts to keep it tidy if the call doesn’t connect.
- `createSipParticipant` uses `waitUntilAnswered: true` by default for a synchronous response. You can disable it by passing `waitUntilAnswered: false` and handle progress asynchronously.
- To update trunk settings programmatically, see `scripts/update-trunk.ts` and run with `npx tsx scripts/update-trunk.ts`.

Python Agent
- Reference agent at `livekit/agent.py:1` reads dispatch or room metadata and asks all `questions` in order. It logs answers and deletes the room when done. No CSV persistence.
- Run with your LiveKit Worker environment (outside this Node app), e.g.: `python livekit/agent.py` after setting provider env vars.
