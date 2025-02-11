import { promises as fs } from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

export async function GET() {
  try {
    const config = {
      accountSid: process.env.ACCOUNT_SID || "",
      authToken: process.env.AUTH_TOKEN || "",
      serviceSid: process.env.SERVICE_SID || "",
    };
    return new Response(JSON.stringify(config), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ accountSid: "", authToken: "", serviceSid: "" }),
      { status: 200 }
    );
  }
}

export async function POST(req) {
  try {
    const { accountSid, authToken, serviceSid } = await req.json();
    const envPath = path.join(process.cwd(), ".env");
    const envConfig = {
      ACCOUNT_SID: accountSid || process.env.ACCOUNT_SID,
      AUTH_TOKEN: authToken || process.env.AUTH_TOKEN,
      SERVICE_SID: serviceSid || process.env.SERVICE_SID,
    };
    const envContent = Object.entries(envConfig)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");
    await fs.writeFile(envPath, envContent);
    console.log("Configuration saved");
    dotenv.config(); // Reload the .env file
    return new Response("Configuration saved", { status: 200 });
  } catch (error) {
    return new Response("Error saving configuration", { status: 500 });
  }
}
