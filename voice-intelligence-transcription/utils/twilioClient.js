import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

export function getTwilioClient() {
  const accountSid = process.env.ACCOUNT_SID;
  const authToken = process.env.AUTH_TOKEN;
  const client = twilio(accountSid, authToken);
  console.log("Twilio client created");
  return client;
}
