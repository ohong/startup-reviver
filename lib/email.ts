'use server';

import { Resend, type CreateEmailOptions, type CreateEmailResponseSuccess } from 'resend';

type SendMailResult = CreateEmailResponseSuccess & {
  headers: Record<string, string> | null;
};

let resendClient: Resend | null = null;
let resendFromAddress: string | null = null;

const getResendClient = () => {
  if (resendClient) {
    return resendClient;
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error('Missing RESEND_API_KEY environment variable.');
  }

  resendClient = new Resend(apiKey);
  return resendClient;
};

const getResendFromAddress = () => {
  if (resendFromAddress) {
    return resendFromAddress;
  }

  const fromAddress = process.env.RESEND_FROM_EMAIL;

  if (!fromAddress) {
    throw new Error('Missing RESEND_FROM_EMAIL environment variable.');
  }

  resendFromAddress = fromAddress;
  return resendFromAddress;
};

export type SendMailOptions = Omit<CreateEmailOptions, 'from'>;

export const sendMail = async (options: SendMailOptions): Promise<SendMailResult> => {
  const client = getResendClient();
  const from = getResendFromAddress();
  const response = await client.emails.send({ ...options, from } as CreateEmailOptions);

  if (response.error) {
    throw new Error(`Resend failed: ${response.error.name} - ${response.error.message}`);
  }

  if (!response.data) {
    throw new Error('Resend did not return a response payload.');
  }

  return {
    ...response.data,
    headers: response.headers,
  };
};
