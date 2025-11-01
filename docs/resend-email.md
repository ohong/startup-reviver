# Resend Mail Helper

This project exposes a reusable helper for sending transactional emails without creating an API layer.

## Prerequisites

- Install dependencies with `npm install`.
- Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL=noreply@updates.tie.uz` in your environment (e.g. `.env.local`).

## Helper Location

- `lib/email.ts` exports the server-only `sendMail` function.

```ts
import { sendMail } from '@/lib/email';

await sendMail({
  to: ['founder@example.com'],
  subject: 'Welcome aboard',
  html: '<p>Thanks for joining Startup Reviver.</p>',
});
```

**Notes**

- Provide at least one of `html`, `text`, `react`, or `template` payload options (Resend validates this).
- The helper throws if the API key is missing or Resend returns an error; wrap calls if you need custom error handling.
- The `from` address always resolves to `RESEND_FROM_EMAIL`, so callers never need to supply it.
- Successful calls resolve with the created email id and response headers.
