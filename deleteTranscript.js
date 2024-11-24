require("dotenv").config();

const twilio = require("twilio");
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

async function deleteTranscript(_sid) {
  try {
    const transcript = await client.intelligence.v2.transcripts(_sid).remove();
    console.log(`Transcript ${_sid} deleted successfuly.`);
  } catch (error) {
    console.log(`ERROR: SID: ${_sid} not found.`);
  }
}

deleteTranscript("GT4142c055166901455eeef18bc50ae7eb");
