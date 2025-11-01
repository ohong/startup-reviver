// Hit the outbound-call API using local dev server
// Usage: npm run api:call -- +15551230000

// Try to load .env if dotenv is available
try {
  const dotenv = await import('dotenv');
  dotenv.config();
} catch {}

const API_URL = process.env.OUTBOUND_API_URL || 'http://localhost:3000/api/calls/outbound';

async function main() {
  const to = process.argv[2] || process.env.TEST_CALL_TO;
  if (!to) {
    console.error('Usage: npm run api:call -- +15551230000');
    process.exit(2);
  }

  const questions = process.env.TEST_CALL_QUESTIONS
    ? process.env.TEST_CALL_QUESTIONS.split('\n').filter(Boolean)
    : [
        'What is your first and last name?',
        'What is your company name?',
        'Do you prefer a morning or afternoon meeting?',
      ];

  const body = { to, questions };
  console.log('POST', API_URL, body);

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  console.log('Status:', res.status);
  try {
    console.log('Body:', JSON.parse(text));
  } catch {
    console.log('Body:', text);
  }
}

main().catch((err) => {
  console.error('Failed to call API:', err);
  console.error('Is the dev server running? Try: npm run dev');
  process.exit(1);
});

