import { getTwilioClient } from "../../../utils/twilioClient";

export async function GET(request) {
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
    // console.log("Selected Service:", service);

    const operators = await client.intelligence.v2.operators.list({
      limit: 50,
    });

    // console.log("Operators:", operators);

    const attachedOperators = await client.intelligence.v2
      .operatorAttachments(service.sid)
      .fetch();

    // console.log("Attached Operators:", attachedOperators);

    const attachedOperatorsDetails = [];
    attachedOperators.operatorSids.map((attachedOperator) => {
      //   console.log("Attached Operator:", attachedOperator);
      const operatorDetails = operators.find(
        (op) => op.sid === attachedOperator
      );
      if (operatorDetails) {
        attachedOperatorsDetails.push({
          serviceSid: attachedOperators.serviceSid,
          accountSid: operatorDetails.accountSid,
          sid: operatorDetails.sid,
          friendlyName: operatorDetails.friendlyName,
          description: operatorDetails.description,
          author: operatorDetails.author,
          operatorType: operatorDetails.operatorType,
          version: operatorDetails.version,
          availability: operatorDetails.availability,
          config: operatorDetails.config,
          dateCreated: operatorDetails.dateCreated,
          dateUpdated: operatorDetails.dateUpdated,
          url: operatorDetails.url,
        });
      }
      //   console.log("Details", operatorDetails);
    });

    // console.log("Attached Operators Details:", attachedOperatorsDetails);

    return new Response(
      JSON.stringify({
        selectedService: {
          sid: service.sid,
          friendly_name: service.friendlyName,
          unique_name: service.uniqueName,
          date_created: service.dateCreated,
          date_updated: service.dateUpdated,
        },
        attachedOperators: attachedOperatorsDetails,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.log("Error fetching attached operators:", error);
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
