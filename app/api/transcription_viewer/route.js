import { NextResponse } from "next/server";

export async function POST(req, context) {
  try {
    const { transcriptSid, serviceSid } = await req.json(); // Extract the SID from the request body
    console.log(
      `Transcription Viewer Initialization:\nTranscript SID: ${transcriptSid}\nService SID: ${serviceSid}`
    );

    if (!transcriptSid) {
      throw new Error("SID parameter is missing");
    }

    // Fetch Twilio credentials from the /api/config endpoint
    const configResponse = await fetch(
      `http://${req.headers.get("host")}/api/config`
    );
    if (!configResponse.ok) {
      console.log("Failed Config response:", configResponse);
      throw new Error("Failed to fetch configuration");
    }
    const config = await configResponse.json();
    const TWILIO_ACCOUNT_SID = config.accountSid;
    const TWILIO_AUTH_TOKEN = config.authToken; // Use the actual token from the environment

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      return new Response("Twilio credentials are not set", { status: 500 });
    }

    const oneTimeTokenResponse = await fetch(
      "https://ai.twilio.com/v1/Tokens",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(
            `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`
          ).toString("base64")}`,
        },
        body: JSON.stringify({
          grants: [
            {
              product: "annotator",
              service_sid: serviceSid,
              transcript_sid: transcriptSid,
              metadata: {
                userId: "VoiceIntelligence Tool",
                isDownloadButtonVisible: true,
              },
            },
          ],
        }),
      }
    );

    if (!oneTimeTokenResponse.ok) {
      throw new Error(
        `Failed to fetch one-time token: ${oneTimeTokenResponse.statusText}`
      );
    }
    const { token, token_expiration } = await oneTimeTokenResponse.json();
    return new Response(token);
  } catch (error) {
    console.error("Error fetching operator results:", error);
    return new Response(error.message, { status: 500 });
  }
}
