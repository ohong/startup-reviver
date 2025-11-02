import { RoomServiceClient, SipClient } from 'livekit-server-sdk';
import { RoomAgentDispatch } from '@livekit/protocol';

let sipClientSingleton: SipClient | null = null;
let roomServiceSingleton: RoomServiceClient | null = null;

export type OutboundCallOptions = {
  to: string;
  roomName?: string;
  fromNumber?: string;
  questions?: string[];
  agentName?: string;
  waitUntilAnswered?: boolean;
  recipientName?: string;
  rowIndex?: number;
};

export function ensureLivekitEnv() {
  const missing: string[] = [];
  if (!process.env.LIVEKIT_URL) missing.push('LIVEKIT_URL');
  if (!process.env.LIVEKIT_API_KEY) missing.push('LIVEKIT_API_KEY');
  if (!process.env.LIVEKIT_API_SECRET) missing.push('LIVEKIT_API_SECRET');
  if (!process.env.LIVEKIT_SIP_OUTBOUND_TRUNK_ID)
    missing.push('LIVEKIT_SIP_OUTBOUND_TRUNK_ID');

  if (missing.length) {
    throw new Error(
      `Missing required LiveKit environment variables: ${missing.join(', ')}`,
    );
  }
}

export function getSipClient() {
  if (sipClientSingleton) return sipClientSingleton;
  ensureLivekitEnv();
  sipClientSingleton = new SipClient(
    process.env.LIVEKIT_URL as string,
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
  );
  return sipClientSingleton;
}

export function getRoomServiceClient() {
  if (roomServiceSingleton) return roomServiceSingleton;
  ensureLivekitEnv();
  roomServiceSingleton = new RoomServiceClient(
    process.env.LIVEKIT_URL as string,
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
  );
  return roomServiceSingleton;
}

export async function createRoomForCall(options: OutboundCallOptions) {
  const roomService = getRoomServiceClient();

  const roomName =
    options.roomName || `call-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  const questions = Array.isArray(options.questions) ? options.questions : [];
  const roomMetadata = JSON.stringify({
    kind: 'outbound-call',
    to: options.to,
    phone_number: options.to,
    fromNumber: options.fromNumber,
    recipient_name: options.recipientName,
    row_index: options.rowIndex,
    questions,
    question: questions[0],
  });

  const agents: RoomAgentDispatch[] = [];
  const agentName = options.agentName || process.env.LIVEKIT_AGENT_NAME;
  if (agentName) {
    agents.push(
      new RoomAgentDispatch({
        agentName,
        metadata: JSON.stringify({
          to: options.to,
          phone_number: options.to,
          recipient_name: options.recipientName,
          row_index: options.rowIndex,
          questions,
          question: questions[0],
        }),
      }),
    );
  }

  await roomService.createRoom({
    name: roomName,
    emptyTimeout: 60, // keep open briefly while dialing
    departureTimeout: 60,
    metadata: roomMetadata,
    ...(agents.length ? { agents } : {}),
  });

  return roomName;
}

export async function placeOutboundCall(options: OutboundCallOptions) {
  ensureLivekitEnv();
  const sipClient = getSipClient();
  const roomName = await createRoomForCall(options);

  const trunkId = process.env.LIVEKIT_SIP_OUTBOUND_TRUNK_ID as string;

  const sipParticipant = await sipClient.createSipParticipant(
    trunkId,
    options.to,
    roomName,
    {
      fromNumber: options.fromNumber || process.env.LIVEKIT_SIP_FROM_NUMBER || undefined,
      playDialtone: true,
      waitUntilAnswered: options.waitUntilAnswered ?? true,
      krispEnabled: true,
      hidePhoneNumber: true,
      ringingTimeout: 30,
      maxCallDuration: 30 * 60, // 30 minutes
    },
  );

  return { roomName, sipParticipant };
}
