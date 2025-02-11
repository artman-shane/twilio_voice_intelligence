import { getTwilioClient } from "../../../utils/twilioClient";

export async function GET() {
  try {
    const client = await getTwilioClient();
    const operators = await client.intelligence.v2.operators.list({
      limit: 50,
    });
    return new Response(
      JSON.stringify(
        operators.map((operator) => ({
          accountSid: operator.account_sid,
          sid: operator.sid,
          friendlyName: operator.friendly_name,
          description: operator.description,
          author: operator.author,
          operatorType: operator.operator_type,
          version: operator.version,
          availability: operator.availability,
          config: operator.config,
          dateCreated: operator.date_created,
          dateUpdated: operator.date_updated,
          url: operator.url,
        }))
      ),
      { status: 200 }
    );
  } catch (error) {
    console.log("Error fetching operators:", error);
    return new Response(error.message, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { sid: operatorSid } = await request.json();

    // Fetch Twilio credentials from the /api/config endpoint
    const configResponse = await fetch(`http://${request.headers.get("host")}/api/config`);
    if (!configResponse.ok) {
      console.log("Failed Config response:", configResponse);
      throw new Error("Failed to fetch configuration");
    }
    const config = await configResponse.json();
    const { accountSid, authToken } = config;

    const response = await fetch(`https://intelligence.twilio.com/v2/Operators/Custom/${operatorSid}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to delete operator: ${response.statusText}`);
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.log("Error deleting operator:", error);
    return new Response(error.message, { status: 500 });
  }
}