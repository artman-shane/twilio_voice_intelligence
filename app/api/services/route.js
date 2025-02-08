import { getTwilioClient } from '../../../utils/twilioClient';

export async function GET() {
  try {
    const client = await getTwilioClient();
    const services = await client.intelligence.v2.services.list();
    return new Response(
      JSON.stringify(
        services.map((service) => ({
          sid: service.sid,
          uniqueName: service.uniqueName,
          friendlyName: service.friendlyName,
          languageCode: service.languageCode,
          dateCreated: service.dateCreated,
          version: service.version,
        }))
      ),
      { status: 200 }
    );
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
}