import { getTwilioClient } from "../../../utils/twilioClient";
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const client = await getTwilioClient();
    const transcripts = await client.intelligence.v2.transcripts.list();
    return new Response(
      JSON.stringify(
        transcripts.map((transcript) => ({
          sid: transcript.sid,
          mediaUrl: transcript.channel.media_properties.media_url,
          dateCreated: transcript.dateCreated,
          dateUpdated: transcript.dateUpdated,
          duration: transcript.duration,
          status: transcript.status,
        }))
      ),
      { status: 200 }
    );
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
}

const configPath = path.join(process.cwd(), 'config.json');

export async function createTranscript(media_url, _participants) {
  const client = await getTwilioClient();
  const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
  const transcript = await client.intelligence.v2.transcripts.create({
    channel: {
      media_properties: {
        media_url: media_url,
      },
      participants: _participants,
    },
    serviceSid: config.serviceSid,
  });
  return transcript;
}
