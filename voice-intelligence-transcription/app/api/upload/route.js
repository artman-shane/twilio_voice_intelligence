import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { getTwilioClient } from '../../../utils/twilioClient';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const filePath = path.join(process.cwd(), 'public/uploads', file.name);

    // Save the file to the uploads directory
    await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));

    // Use the Twilio client to upload the file and get the transcript SID
    const client = getTwilioClient();
    const mediaUrl = `http://shane.ngrok.io/uploads/${file.name}`;
    const participants = []; // Add participants if needed

    const transcript = await client.intelligence.v2.transcripts.create({
      channel: {
        media_properties: {
          media_url: mediaUrl,
        },
        participants: participants,
      },
      serviceSid: process.env.SERVICE_SID,
    });

    return new NextResponse(JSON.stringify({ transcriptSid: transcript.sid }), { status: 200 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }
}