require("dotenv").config();

// Download the helper library from https://www.twilio.com/docs/node/install
const twilio = require("twilio");
const express = require("express");
const multer = require("multer");
const path = require("path");
const ngrok = require("ngrok");
const fs = require("fs");
const util = require("util");

// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
const url = "https://shane.ngrok.io";

async function createTranscript(media_url, _participants) {
  const transcript = await client.intelligence.v2.transcripts.create({
    channel: {
      media_properties: {
        media_url: media_url,
      },
      participants: _participants,
    },
    serviceSid: process.env.VOICE_INTELLIGENCE_SID,
  });

  console.log(`Transcript created with SID: ${transcript.sid}`);
  return transcript.sid;
}
const app = express();
const expressPort = 3000;
const ngrokPort = 4000;

// Set up storage for multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Serve static files from the public directory
app.use(express.static("public"));

// Endpoint to handle file uploads
app.post("/upload", upload.single("file"), async (req, res) => {
  req.file?.originalname
    ? console.log(`Received request to upload file: `, req.file?.originalname)
    : null;
  req.file?.size ? console.log(`File Size: `, req.file?.size) : null;
  const file = req.file;
  if (!file) {
    console.log(`No file uploaded.`);
    return res.status(400).send("No file uploaded.");
  }

  const fileType = path.extname(file.originalname).toLowerCase();
  if (fileType !== ".mp3" && fileType !== ".flac" && fileType !== ".wav") {
    console.log(`Invalid file type: ${fileType}`);
    return res
      .status(400)
      .send("Invalid file type. Only mp3, flac, and wav files are allowed.");
  }

  try {
    const writeFile = util.promisify(fs.writeFile);

    // Save the file to the local filesystem
    const filePath = path.join(__dirname, "uploads", file.originalname);
    await writeFile(filePath, file.buffer);

    const mediaUrl = `${url}/uploads/${file.originalname}`;
    console.log(`Creating transcript for file: ${mediaUrl}`);
    const participants = [
      {
        channel_participant: 1,
        image_url: "https://shane.ngrok.io/uploads/customer.png",
        full_name: "Anna",
        role: "Customer",
        email: "customer.email@gmail.com",
        user_id: "(770)555-1234",
        media_participant_id: "Customer-12345",
      },
      {
        channel_participant: 2,
        image_url: "https://shane.ngrok.io/uploads/agent.png",
        full_name: "Marvin",
        role: "Agent",
        email: "agent@ashleyfurniture.com",
        user_id: "Agent-12345",
        media_participant_id: "Media-12345",
      },
    ];
    const transcriptSid = await createTranscript(mediaUrl, participants);
    const response = {
      message: `Success: SID: ${transcriptSid}`,
      transcriptSid,
    };
    console.log(`Response: `, response);
    res.json(response);
  } catch (error) {
    console.error("Error creating transcript:", error);
    res.status(500).send(`Error creating transcript: ${error.message}`);
  }
});

// (async function () {
//   const ngrokUrl = await ngrok.connect({
//     proto: "http",
//     addr: ngrokPort,
//     subdomain: "shane",
//   });
//   console.log(`ngrok tunnel running at ${ngrokUrl}`);
// })();

// Start the server
app.listen(expressPort, () => {
  console.log(`Server running at http://localhost:${expressPort}`);
});
// Endpoint to handle deletion of transcript and file
// app.post("/delete", express.json(), async (req, res) => {
//   const { transcriptSid, fileName } = req.body;
//   console.log(
//     `Received request to delete transcript and file: `,
//     transcriptSid,
//     fileName
//   );

//   if (!transcriptSid || !fileName) {
//     console.log(`Transcript SID and file name are required.`);
//     return res.status(400).send("Transcript SID and file name are required.");
//   }

//   try {
//     // Delete the transcript
//     await client.intelligence.v2.transcripts(transcriptSid).remove();
//     console.log(`Transcript with SID: ${transcriptSid} deleted.`);

//     // Delete the file from the local filesystem
//     const filePath = path.join(__dirname, "uploads", fileName);
//     const unlinkFile = util.promisify(fs.unlink);
//     await unlinkFile(filePath);
//     console.log(`File: ${filePath} deleted.`);

//     res.send("Transcript and file deleted successfully.");
//   } catch (error) {
//     console.error("Error deleting transcript or file:", error);
//     res.status(500).send("Error deleting transcript or file.");
//   }
// });

// Endpoint to handle deletion of transcript and file
app.post("/delete", express.json(), async (req, res) => {
  const { transcriptSid, fileName } = req.body;
  console.log(
    `Received request to delete transcript and file: `,
    transcriptSid,
    fileName
  );

  if (!transcriptSid) {
    console.log(`Transcript SID is required.`);
    return res.status(400).send("Transcript SID is required.");
  }

  try {
    // Delete the transcript
    await client.intelligence.v2.transcripts(transcriptSid).remove();
    console.log(`Transcript with SID: ${transcriptSid} deleted.`);

    if (fileName) {
      // Delete the file from the local filesystem
      const filePath = path.join(__dirname, 'uploads', fileName);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error deleting file: ${fileName}`, err);
          return res.status(500).send(`Error deleting file: ${fileName}`);
        }
        console.log(`File ${fileName} deleted.`);
        res.send(`Transcript and file deleted successfully.`);
      });
    } else {
      res.send(`Transcript deleted successfully. No file to delete.`);
    }
  } catch (error) {
    console.error(`Error deleting transcript: ${transcriptSid}`, error);
    res.status(500).send(`Error deleting transcript: ${transcriptSid}`);
  }
});

app.get("/uploads/:filename", (req, res) => {
  const filePath = path.join(
    __dirname,
    "uploads",
    req.params.filename.replace(/\.\.\//g, "")
  );
  res.sendFile(filePath);
});

// Serve the upload form at the root URL
// app.get("/", (req, res) => {
//   res.send(`
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//       <meta charset="UTF-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>Upload Audio File</title>
//     </head>
//     <body>
//       <h1>Upload Audio File for Transcription</h1>
//       <form action="/upload" method="post" enctype="multipart/form-data">
//         <input type="file" name="file" accept=".mp3,.flac,.wav" required>
//         <button type="submit">Upload</button>
//       </form>
//     <script>
//       document.querySelector('input[type="file"]').addEventListener('click', (event) => {
//         const fileName = event.target.files[0]?.name || 'No file chosen';
//         const messageDiv = document.getElementById('message');
//         messageDiv.textContent = \`Selected file: $\{fileName\}\`;
//         messageDiv.style.color = 'blue';
//       });
//       document.querySelector('input[type="file"]').addEventListener('change', (event) => {
//         const fileName = event.target.files[0]?.name || 'No file chosen';
//         const messageDiv = document.getElementById('message');
//         messageDiv.textContent = \`Selected file: $\{fileName\}\`;
//         messageDiv.style.color = 'blue';
//       });
//     </script>
//     <div id="message"></div>
//     <script>
//       document.querySelector('form').addEventListener('submit', async (event) => {
//         event.preventDefault();
//         const formData = new FormData(event.target);
//         console.log('Uploading file:', formData.get('file').name);
//         const response = await fetch('/upload', {
//           method: 'POST',
//           body: formData,
//         });
//         console.log(response);

//         const messageDiv = document.getElementById('message');
//         messageDiv.textContent = 'Uploading file...';
//         if (response.status === 200) {
//           const data = await response.json();
//           console.log('Response.Data: ',data);
//           const message = "data.message: " + data.message + "transcriptSid: " + data.transcriptSid;
//           const transcriptSid = data.transcriptSid;
//           const fileList = document.getElementById('fileList');
//           const listItem = document.createElement('li');
          
//           messageDiv.textContent = "Success - transcriptSid: " + transcriptSid;
//           messageDiv.style.color = 'green';
          
//           const deleteButton = document.createElement('button');
//           deleteButton.textContent = 'X';
//           deleteButton.style.marginLeft = '10px';

//           listItem.textContent = formData.get("file").name + ' - SID: ' + transcriptSid;
//           listItem.appendChild(deleteButton);
//           fileList.appendChild(listItem);

//           deleteButton.addEventListener('click', async () => {
//             const deleteResponse = await fetch('/delete', {
//               method: 'POST',
//               headers: {
//                 'Content-Type': 'application/json',
//               },
//               body: JSON.stringify({ transcriptSid, fileName: formData.get('file').name }),
//             });

//             if (deleteResponse.ok) {
//               fileList.removeChild(listItem);
//             } else {
//               const errorText = await deleteResponse.text();
//               alert('Error deleting file: ' + errorText);
//             }
//           });
//         } else {
//           const errorText = await response.text();
//           messageDiv.textContent = 'Error: ' + errorText;
//           messageDiv.style.color = 'red';
//         }
//       });
//     </script>
//     <h2>Uploaded Files</h2>
//     <ul style="list-style-type: none;" id="fileList"></ul>
//     </body>
//     </html>
//   `);
// });
app.get("/", async (req, res) => {
  try {
    const transcripts = await client.intelligence.v2.transcripts.list();
    const transcriptList = transcripts.map(transcript => ({
      sid: transcript.sid,
      mediaUrl: transcript.media_url
    }));

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Upload Audio File</title>
      </head>
      <body>
        <h1>Upload Audio File for Transcription</h1>
        <form action="/upload" method="post" enctype="multipart/form-data">
          <input type="file" name="file" accept=".mp3,.flac,.wav" required>
          <button type="submit">Upload</button>
        </form>
        <div id="message"></div>
        <h2>Uploaded Files</h2>
        <ul style="list-style-type: none;" id="fileList"></ul>
        <script>
          const transcripts = ${JSON.stringify(transcriptList)};
          const fileList = document.getElementById('fileList');

          transcripts.forEach(transcript => {
            const listItem = document.createElement('li');
            listItem.textContent = 'SID: ' + transcript.sid;

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'X';
            deleteButton.style.marginLeft = '10px';
            deleteButton.addEventListener('click', async () => {
              const response = await fetch('/delete', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ transcriptSid: transcript.sid, fileName: null }),
              });

              if (response.ok) {
                fileList.removeChild(listItem);
              } else {
                const errorText = await response.text();
                alert('Error deleting transcript: ' + errorText);
              }
            });

            listItem.appendChild(deleteButton);
            fileList.appendChild(listItem);
          });

          document.querySelector('input[type="file"]').addEventListener('click', (event) => {
            const fileName = event.target.files[0]?.name || 'No file chosen';
            const messageDiv = document.getElementById('message');
            messageDiv.textContent = \`Selected file: $\{fileName\}\`;
            messageDiv.style.color = 'blue';
          });

          document.querySelector('input[type="file"]').addEventListener('change', (event) => {
            const fileName = event.target.files[0]?.name || 'No file chosen';
            const messageDiv = document.getElementById('message');
            messageDiv.textContent = \`Selected file: $\{fileName\}\`;
            messageDiv.style.color = 'blue';
          });

          document.querySelector('form').addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            const messageDiv = document.getElementById('message');
            messageDiv.textContent = 'Uploading file...';

            const response = await fetch('/upload', {
              method: 'POST',
              body: formData,
            });

            if (response.status === 200) {
              const data = await response.json();
              messageDiv.textContent = 'Success - transcriptSid: ' + data.transcriptSid;
              messageDiv.style.color = 'green';

              const listItem = document.createElement('li');
              listItem.textContent = formData.get('file').name + ' - SID: ' + data.transcriptSid;

              const deleteButton = document.createElement('button');
              deleteButton.textContent = 'X';
              deleteButton.style.marginLeft = '10px';
              deleteButton.addEventListener('click', async () => {
                const response = await fetch('/delete', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ transcriptSid: data.transcriptSid, fileName: formData.get('file').name }),
                });

                if (response.ok) {
                  fileList.removeChild(listItem);
                } else {
                  const errorText = await response.text();
                  alert('Error deleting transcript: ' + errorText);
                }
              });

              listItem.appendChild(deleteButton);
              fileList.appendChild(listItem);
            } else {
              const errorText = await response.text();
              messageDiv.textContent = 'Error: ' + errorText;
              messageDiv.style.color = 'red';
            }
          });
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send(error.message);
  }
});