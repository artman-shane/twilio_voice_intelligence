import { NextResponse } from "next/server";

export async function POST(req) {
  try {
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
    const TWILIO_AUTH_TOKEN = config.authToken;

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      return new Response("Twilio credentials are not set", { status: 500 });
    }

    console.log("Creating operator req:", req);

    // Get the operator data from the request body
    const formData = await req.formData();
    const operatorData = {};
    formData.forEach((value, key) => {
      operatorData[key] = value;
    });
    console.log("Operator data:", operatorData);

    const url = `https://intelligence.twilio.com/v2/Operators/Custom`;
    const auth = Buffer.from(
      `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`
    ).toString("base64");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${auth}`,
      },
      body: new URLSearchParams(operatorData).toString(),
    });

    if (!response.ok) {
      console.log("Failed Operator response:", response);
      throw new Error(`Failed to create operator: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating operator:", error);
    return new Response(error.message, { status: 500 });
  }
}
