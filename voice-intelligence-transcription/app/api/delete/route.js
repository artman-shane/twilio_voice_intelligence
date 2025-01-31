import { getTwilioClient } from '../../../utils/twilioClient';

export async function POST(req) {
  const { transcriptSid } = await req.json();

  if (!transcriptSid) {
    return new Response('Transcript SID is required', { status: 400 });
  }

  try {
    const client = await getTwilioClient();
    await client.intelligence.v2.transcripts(transcriptSid).remove();
    return new Response('Transcript deleted successfully', { status: 200 });
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
}