import { sendMail } from '@/lib/email';

async function main() {
  const response = await sendMail({
    to: ['falconuz30@gmail.com'],
    subject: 'Startup Reviver Test Email',
    text: 'Hello from Startup Reviver via Resend.',
  });

  console.log('Sent email id:', response.id);
  console.log('Response headers:', response.headers);
}

main().catch((error) => {
  console.error('Failed to send email:', error);
  process.exit(1);
});
