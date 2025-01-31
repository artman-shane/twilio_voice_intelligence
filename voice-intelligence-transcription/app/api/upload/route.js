import { promises as fs } from 'fs';
import path from 'path';
import formidable from 'formidable';
import { getTwilioClient } from '../../../utils/twilioClient';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  const form = new formidable.IncomingForm();
  form.uploadDir = path.join(process.cwd(), 'public/uploads');
  form.keepExtensions = true;

  return new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        reject(new Response('Error parsing form', { status: 500 }));
        return;
      }

      const file = files.file;
      const filePath = file.path;
      const mediaUrl = `http://localhost:3000/uploads/${path.basename(filePath)}`;

      try {
        const client = await getTwilioClient();
        const transcript = await client.intelligence.v2.transcripts.create({
          channel: {
            media_properties: {
              media_url: mediaUrl,
            },
          },
        });

        resolve(new Response(JSON.stringify({ transcriptSid: transcript.sid }), { status: 200 }));
      } catch (error) {
        reject(new Response(error.message, { status: 500 }));
      }
    });
  });
}