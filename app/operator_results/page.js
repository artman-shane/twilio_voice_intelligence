"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Button,
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

export default function OperatorResults() {
  const [operatorResults, setOperatorResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const transcriptSid = searchParams.get("transcriptSid");

  useEffect(() => {
    const fetchOperatorResults = async () => {
      try {
        console.log(
          "Fetching operator results for transcript SID:",
          transcriptSid
        );
        const response = await fetch(`/api/operator_results/${transcriptSid}`);
        if (!response.ok) {
          setIsLoading(false);
          setOperatorResults({ error: "Failed to fetch operator results" });
          return;
        }
        const data = await response.json();
        setOperatorResults(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching operator results:", error);
        setIsLoading(false);
      }
    };

    if (transcriptSid) {
      fetchOperatorResults();
    } else {
      router.push("/");
    }
  }, [transcriptSid, router]);

  const renderJsonResults = (jsonResults, parentIndex) => {
    return (
      <Paper
        elevation={3}
        style={{ padding: "16px", marginTop: "16px" }}
        key={`json-results-${parentIndex}`}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          Operator Results
        </Typography>
        <List>
          {Object.entries(jsonResults).map(([key, value], index) => (
            <ListItem key={`${key}-${index}`}>
              <ListItemText primary={key} secondary={value} />
            </ListItem>
          ))}
        </List>
      </Paper>
    );
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Operator Results
      </Typography>
      <Box mt={2}>
        <Button variant="contained" color="primary" onClick={() => router.back()}>
          Back
        </Button>
      </Box>
      {isLoading ? (
        <Typography variant="h6" color="textSecondary">
          Loading...
        </Typography>
      ) : (
        <Box mt={4}>
          {operatorResults && operatorResults.error ? (
            <Typography variant="h6" color="error">
              {operatorResults.error}
            </Typography>
          ) : (
            operatorResults &&
            operatorResults.operator_results &&
            operatorResults.operator_results.map(
              (result, index) =>
                result.json_results &&
                renderJsonResults(result.json_results, index)
            )
          )}
        </Box>
      )}
    </Container>
  );
}
