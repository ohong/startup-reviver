import { placeOutboundCall } from '../lib/livekit';

// Try to load .env if dotenv is available
try {
  const dotenv = await import('dotenv');
  dotenv.config();
} catch {}

async function main() {
  const toArg = process.argv[2] || process.env.TEST_CALL_TO;
  const fromNumber = process.env.LIVEKIT_SIP_FROM_NUMBER;
  const questions = process.env.TEST_CALL_QUESTIONS
    ? process.env.TEST_CALL_QUESTIONS.split('\n').filter(Boolean)
    : [
        'What is your first and last name?',
        'What is your company name?',
        'Do you prefer a morning or afternoon meeting?',
      ];

  if (!toArg) {
    console.error('Usage: npx tsx scripts/place-call.ts +15551230000');
    process.exit(2);
  }

  const res = await placeOutboundCall({
    to: toArg,
    fromNumber,
    questions,
    waitUntilAnswered: true,
  });

  console.log('Call bridged. Room:', res.roomName);
  console.log('SIP participant info:', res.sipParticipant);
}

main().catch((err) => {
  console.error('Call failed:', err);
  process.exit(1);
});
