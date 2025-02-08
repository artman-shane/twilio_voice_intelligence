import { NextResponse } from "next/server";

export async function GET(req, context) {
  try {
    const { params } = context;
    const { sid } = await params; // Extract the SID from the dynamic route
    console.log("Fetching operator results for transcript SID:", sid);

    if (!sid) {
      throw new Error("SID parameter is missing");
    }

    // Fetch Twilio credentials from the /api/config endpoint
    const configResponse = await fetch(
      `http://${req.headers.get("host")}/api/config`
    );
    if (!configResponse.ok) {
      throw new Error("Failed to fetch configuration");
    }
    const config = await configResponse.json();
    const TWILIO_ACCOUNT_SID = config.accountSid;
    const TWILIO_AUTH_TOKEN = process.env.AUTH_TOKEN; // Use the actual token from the environment

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      return new Response("Twilio credentials are not set", { status: 500 });
    }

    const url = `https://intelligence.twilio.com/v2/Transcripts/${sid}/OperatorResults?Redacted=false`;
    const auth = Buffer.from(
      `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`
    ).toString("base64");

    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch operator results: ${response.statusText}`
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching operator results:", error);
    return new Response(error.message, { status: 500 });
  }
}
