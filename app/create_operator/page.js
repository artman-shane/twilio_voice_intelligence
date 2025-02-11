"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container, TextField, Button, Typography, Paper, TextareaAutosize, Box, Select, MenuItem, IconButton, Tooltip } from "@mui/material";
import ContentPasteIcon from '@mui/icons-material/ContentPaste';

export default function CreateOperator() {
  const [friendlyName, setFriendlyName] = useState("");
  const [operatorType, setOperatorType] = useState("");
  const [config, setConfig] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handlePasteExample = () => {
    if (operatorType === "GenerativeJSON") {
      setConfig(`{
        "prompt": "<An Example of what the operator should do and how it should behave>",
        "json_result_schema": {
            "$schema": "http://json-schema.org/draft-04/schema#",
            "type": "object",
            "properties": {
               "<name of 1st property to return>": {
                "type": "string",
                "description": "<Tell LLM how to generate this>"
                },
               "<name of 2nd property to return>": {
                "type": "string",
                "description": "<Tell LLM how to generate this>"
                },
                "<name of 3rd property to return": {
                "type": "boolean",
                "description": "<Tell LLM how to generate (Yes/No)>"
                }
            }
        },
        "examples": []
      }`);
    } else if (operatorType === "Generative") {
      setConfig(`{
        "prompt": "<Instruct the LLM what you are trying to generate out of this operator. Example would be Extract the name of the customer from this transcript. If you cannot determine who the customer is, populate the field with a blank response>",
        "examples": []
      }`);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new URLSearchParams();
    formData.append("FriendlyName", friendlyName);
    formData.append("OperatorType", operatorType);
    formData.append("Config", config);

    setMessage("Creating operator...");

    const response = await fetch("/api/create_operator", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (response.status === 200) {
      const data = await response.json();
      setMessage(`Success - Operator SID: ${data.sid}`);
      router.push("/");
    } else {
      const errorText = await response.text();
      setMessage(<span style={{ color: "red" }}>Error: {errorText}</span>);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Create Custom Operator
      </Typography>
      <Paper elevation={3} style={{ padding: "16px", marginBottom: "16px" }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Friendly Name"
            value={friendlyName}
            onChange={(e) => setFriendlyName(e.target.value)}
            variant="outlined"
            margin="normal"
            required
          />
          <Box display="flex" alignItems="center">
            <Select
              fullWidth
              value={operatorType}
              onChange={(e) => setOperatorType(e.target.value)}
              variant="outlined"
              margin="normal"
              required
              displayEmpty
            >
              <MenuItem value="" disabled>
                Select Operator Type
              </MenuItem>
              <MenuItem value="Generative">Generative</MenuItem>
              <MenuItem value="GenerativeJSON">GenerativeJSON</MenuItem>
            </Select>
            <Tooltip title="Paste an example">
              <IconButton onClick={handlePasteExample} color="primary" style={{ marginLeft: "8px" }}>
                <ContentPasteIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Box
            component="div"
            sx={{
              border: '1px solid rgba(0, 0, 0, 0.23)',
              borderRadius: '4px',
              padding: '16.5px 14px',
              marginTop: '16px',
              marginBottom: '8px',
            }}
          >
            <TextareaAutosize
              minRows={6}
              placeholder="Config (JSON format)"
              value={config}
              onChange={(e) => setConfig(e.target.value)}
              style={{ width: "100%", fontFamily: "inherit", fontSize: "inherit", border: "none", outline: "none" }}
              required
            />
          </Box>
          <Button type="submit" variant="contained" color="primary" style={{ marginTop: "16px" }}>
            Create Operator
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