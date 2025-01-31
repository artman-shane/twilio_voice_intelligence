import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

export function getTwilioClient() {
  const accountSid = process.env.ACCOUNT_SID;
  const authToken = process.env.AUTH_TOKEN;
  return twilio(accountSid, authToken);
}