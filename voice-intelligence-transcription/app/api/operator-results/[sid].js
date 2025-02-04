import { getTwilioClient } from "../../../utils/twilioClient";

export async function GET(req) {
  console.log("Fetching operator results for transcript SID:", req.query.sid);
  const { sid } = req.query;
  try {
    const client = getTwilioClient();
    const operatorResults = await client.intelligence.v2
      .transcripts(sid)
      .operatorResults.list({ limit: 20 });
    return new Response(JSON.stringify(operatorResults), { status: 200 });
  } catch (error) {
    console.error("Error fetching operator results:", error);
    return new Response(error.message, { status: 500 });
  }
}
