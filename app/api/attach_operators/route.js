import { getTwilioClient } from "../../../utils/twilioClient";

export async function POST(request) {
  try {
    const response = await fetch(
      `http://${request.headers.get("host")}/api/config`
    );
    if (!response.ok) {
      console.log("Failed Config response:", response);
      throw new Error("Failed to fetch configuration");
    }
    const config = await response.json();
    const { serviceSid } = config;

    const client = await getTwilioClient();
    const service = await client.intelligence.v2.services(serviceSid).fetch();

    const { sid: sid } = await request.json();

    console.log("ServiceSid:", serviceSid);
    console.log("OperatorSid:", sid);

    const operatorAttachment = await client.intelligence.v2
      .operatorAttachment(serviceSid, sid)
      .create();

    return new Response(
      JSON.stringify({
        operatorSid: operatorAttachment.operator_sid,
        serviceSid: operatorAttachment.service_sid,
        url: operatorAttachment.url,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.log("Error attaching operator:", error);
    return new Response(error.message, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { serviceSid: serviceSid, sid: sid } = await request.json();
    console.log("ServiceSid:", serviceSid);
    console.log("OperatorSid:", sid);
    const client = await getTwilioClient();

    const deleteAttachedOperator = await client.intelligence.v2
      .operatorAttachment(serviceSid, sid)
      .remove();

    console.log("Delete Attached Operator:", deleteAttachedOperator);

    if (!deleteAttachedOperator) {
      console.log("Failed to delete attached operator:", sid);
      throw new Error("Failed to delete attached operator:");
    }
    return new Response(null, { status: 204 });
  } catch (error) {
    console.log("Error deleting attached operator:", error);
    return new Response(error.message, { status: 500 });
  }
}
