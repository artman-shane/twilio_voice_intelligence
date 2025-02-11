"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Paper,
} from "@mui/material";

const defaultParticipants = [
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

export default function UploadMedia() {
  const [message, setMessage] = useState("");
  const [participants, setParticipants] = useState(defaultParticipants);
  const router = useRouter();

  const handleParticipantChange = (index, field, value) => {
    const updatedParticipants = [...participants];
    updatedParticipants[index][field] = value;
    setParticipants(updatedParticipants);
  };

  const handleFileChange = (event) => {
    const fileName = event.target.files[0]?.name || "No file chosen";
    setMessage(`Selected file: ${fileName}`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    formData.append("participants", JSON.stringify(participants));
    setMessage("Uploading file...");

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    console.log("FormData:", formData);

    if (response.status === 200) {
      const data = await response.json();
      setMessage(`Success - transcriptSid: ${data.transcriptSid}`);
      router.push("/");
    } else {
      const errorText = await response.text();
      setMessage(`Error: ${errorText}`);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Upload Audio File for Transcription
      </Typography>
      <Paper elevation={3} style={{ padding: "16px", marginBottom: "16px" }}>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <TextField
            fullWidth
            type="file"
            name="file"
            accept=".mp3,.flac,.wav"
            required
            onChange={handleFileChange}
            style={{ marginBottom: "16px" }}
          />
          <Typography variant="h5" component="h2" gutterBottom>
            Participants
          </Typography>
          {participants.map((participant, index) => (
            <Box key={index} mb={2}>
              <Typography variant="h6" component="h3" gutterBottom>
                Channel Participant {participant.channel_participant}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={participant.full_name}
                    onChange={(e) =>
                      handleParticipantChange(
                        index,
                        "full_name",
                        e.target.value
                      )
                    }
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={participant.email}
                    onChange={(e) =>
                      handleParticipantChange(index, "email", e.target.value)
                    }
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="User ID"
                    value={participant.user_id}
                    onChange={(e) =>
                      handleParticipantChange(index, "user_id", e.target.value)
                    }
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Media Participant ID"
                    value={participant.media_participant_id}
                    onChange={(e) =>
                      handleParticipantChange(
                        index,
                        "media_participant_id",
                        e.target.value
                      )
                    }
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Image URL"
                    value={participant.image_url}
                    onChange={(e) =>
                      handleParticipantChange(
                        index,
                        "image_url",
                        e.target.value
                      )
                    }
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Role"
                    value={participant.role}
                    onChange={(e) =>
                      handleParticipantChange(index, "role", e.target.value)
                    }
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </Box>
          ))}
          <Button type="submit" variant="contained" color="primary">
            Upload
          </Button>
        </form>
      </Paper>
      {message && (
        <Typography variant="body1" color="textSecondary">
          {message}
        </Typography>
      )}
    </Container>
  );
}
