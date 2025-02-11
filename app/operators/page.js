"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Typography,
  Container,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { styled } from "@mui/material/styles";

const StyledTable = styled(Table)({
  minWidth: 650,
  border: "1px solid #ddd",
});

const StyledTableCell = styled(TableCell)({
  border: "1px solid #ddd",
  color: "#000", // Ensure text color is visible
});

const StyledTableHead = styled(TableHead)({
  backgroundColor: "#f5f5f5",
});

export default function Operators() {
  const [operators, setOperators] = useState([]);
  const [attachedOperators, setAttachedOperators] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [loadingText, setLoadingText] = useState("Loading.");
  const [isLoading, setIsLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const router = useRouter();
  const [selectedAttachedOperator, setSelectedAttachedOperator] =
    useState(null);

  const fetchOperators = async () => {
    try {
      const response = await fetch("/api/operators");
      if (!response.ok) {
        throw new Error("Failed to fetch operators");
      }
      const data = await response.json();
      console.log("Fetched operators:", data); // Debugging
      setOperators(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching operators:", error);
    }
  };

  const fetchAttachedOperators = async () => {
    try {
      const response = await fetch("/api/attached_operators");
      if (!response.ok) {
        throw new Error("Failed to fetch attached operators");
      }
      const data = await response.json();
      console.log("Fetched attached operators:", data); // Debugging
      setSelectedService(data.selectedService);
      const filteredOperators = data.attachedOperators.filter(
        (operator) => operator.author !== "twilio"
      );
      setAttachedOperators(filteredOperators);
    } catch (error) {
      console.error("Error fetching attached operators:", error);
    }
  };

  useEffect(() => {
    fetchOperators();
    fetchAttachedOperators();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingText((prev) => {
        if (prev === "Loading.") return "Loading..";
        if (prev === "Loading..") return "Loading...";
        return "Loading.";
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleMenuOpen = (event, operator) => {
    setAnchorEl(event.currentTarget);
    setSelectedOperator(operator);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOperator(null);
  };

  const handleDelete = async () => {
    if (!selectedOperator) return;
    const response = await fetch(`/api/operators`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sid: selectedOperator.sid }),
    });

    if (response.ok) {
      await fetchOperators(); // Refresh the list of operators
      handleMenuClose();
    } else {
      const errorText = await response.text();
      alert(`Error deleting operator: ${errorText}`);
    }
  };

  const handleAttachedMenuOpen = (event, operator) => {
    setAnchorEl(event.currentTarget);
    setSelectedAttachedOperator(operator);
  };

  const handleAttachedMenuClose = () => {
    setAnchorEl(null);
    setSelectedAttachedOperator(null);
  };

  const handleAttachedDelete = async () => {
    if (!selectedAttachedOperator) return;
    console.log(
      `Deleting attached operator: ${selectedAttachedOperator.sid} from service: ${selectedAttachedOperator.serviceSid}`
    );
    const response = await fetch(`/api/attached_operators`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sid: selectedAttachedOperator.sid,
        serviceSid: selectedAttachedOperator.serviceSid,
      }),
    });

    if (response.ok) {
      await fetchAttachedOperators(); // Refresh the list of attached operators
      handleAttachedMenuClose();
    } else {
      const errorText = await response.text();
      alert(`Error deleting attached operator: ${errorText}`);
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Custom Operators
      </Typography>
      {isLoading ? (
        <Typography variant="h6" color="textSecondary">
          Loading<span>{loadingText.slice(7)}</span>
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Availability</TableCell>
                <TableCell>Version</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {operators.map(
                (operator) =>
                  operator &&
                  operator.author !== "Twilio" && (
                    <TableRow key={operator.sid}>
                      <TableCell>{operator.description}</TableCell>
                      <TableCell>{operator.author}</TableCell>
                      <TableCell>{operator.availability}</TableCell>
                      <TableCell>{operator.version}</TableCell>
                      <TableCell>
                        <IconButton
                          aria-label="more"
                          aria-controls="long-menu"
                          aria-haspopup="true"
                          onClick={(event) => handleMenuOpen(event, operator)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          id="long-menu"
                          anchorEl={anchorEl}
                          keepMounted
                          open={Boolean(anchorEl)}
                          onClose={handleMenuClose}
                        >
                          <MenuItem onClick={handleDelete}>Delete</MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Box mt={4}>
        <Typography variant="h4" component="h2" gutterBottom>
          Attached Operators
        </Typography>
        {selectedService && (
          <Box mb={4}>
            <Typography variant="h5">
              Selected Service:{" "}
              <span
                style={{
                  color: "blue",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                onClick={() => router.push(`/config`)}
              >
                {selectedService.friendly_name}
              </span>
            </Typography>
            <Typography variant="body1">SID: {selectedService.sid}</Typography>
            <Typography variant="body1">
              Unique Name: {selectedService.unique_name}
            </Typography>
            <Typography variant="body1">
              Date Created:{" "}
              {new Date(selectedService.date_created).toLocaleString()}
            </Typography>
            <Typography variant="body1">
              Date Updated:{" "}
              {new Date(selectedService.date_updated).toLocaleString()}
            </Typography>
          </Box>
        )}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Friendly Name</TableCell>
                <TableCell>SID</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Operator Type</TableCell>
                <TableCell>Version</TableCell>
                <TableCell>Availability</TableCell>
                <TableCell>Config</TableCell>
                <TableCell>Date Created</TableCell>
                <TableCell>Date Updated</TableCell>
                <TableCell>URL</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attachedOperators.map((operator) => (
                <TableRow key={operator.sid}>
                  <TableCell>{operator.friendlyName}</TableCell>
                  <TableCell>{operator.sid}</TableCell>
                  <TableCell>{operator.description}</TableCell>
                  <TableCell>{operator.author}</TableCell>
                  <TableCell>{operator.operatorType}</TableCell>
                  <TableCell>{operator.version}</TableCell>
                  <TableCell>{operator.availability}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      title={JSON.stringify(operator.config)}
                    >
                      Hover to view config
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(operator.dateCreated).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {new Date(operator.dateUpdated).toLocaleString()}
                  </TableCell>
                  <TableCell>{operator.url}</TableCell>
                  <TableCell>
                    <IconButton
                      aria-label="more"
                      aria-controls="long-menu"
                      aria-haspopup="true"
                      onClick={(event) =>
                        handleAttachedMenuOpen(event, operator)
                      }
                    >
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      id="attached-menu"
                      anchorEl={anchorEl}
                      keepMounted
                      open={Boolean(anchorEl)}
                      onClose={handleAttachedMenuClose}
                    >
                      <MenuItem onClick={handleAttachedDelete}>Delete</MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
}
