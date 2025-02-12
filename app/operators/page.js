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
  const [anchorElAttached, setAnchorElAttached] = useState(null);
  const [selectedAttachedOperator, setSelectedAttachedOperator] =
    useState(null);
  const [anchorElUnattached, setAnchorElUnattached] = useState(null);
  const [selectedUnattachedOperator, setSelectedUnattachedOperator] =
    useState(null);
  const router = useRouter();

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

  const handleAttachedMenuOpen = (event, operator) => {
    setAnchorElAttached(event.currentTarget);
    setSelectedAttachedOperator(operator);
  };

  const handleAttachedMenuClose = () => {
    setAnchorElAttached(null);
    setSelectedAttachedOperator(null);
  };

  const handleUnattachedMenuOpen = (event, operator) => {
    console.log("Menu Clicked - Unattached operator:", operator);
    setAnchorElUnattached(event.currentTarget);
    setSelectedUnattachedOperator(operator);
  };

  const handleUnattachedMenuClose = () => {
    setAnchorElUnattached(null);
    setSelectedUnattachedOperator(null);
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

  const handleAttach = async (operator) => {
    if (!selectedService) {
      alert("No service selected");
      return;
    }

    console.log("Operator selected to attach:", operator);

    const response = await fetch(`/api/attach_operators`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sid: operator.sid,
        serviceSid: selectedService.sid,
      }),
    });

    if (response.ok) {
      await fetchAttachedOperators(); // Refresh the list of attached operators
      handleUnattachedMenuClose();
    } else {
      const errorText = await response.text();
      alert(`Error attaching operator: ${errorText}`);
    }
  };

  // Filter operators to exclude attached operators
  const unattachedOperators = operators.filter(
    (operator) =>
      !attachedOperators.some(
        (attachedOperator) => attachedOperator.sid === operator.sid
      )
  );

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
                      <TableCell>
                        <IconButton
                          aria-label="more"
                          aria-controls={`menu-${operator.sid}`}
                          aria-haspopup="true"
                          onClick={(event) => handleMenuOpen(event, operator)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          id={`menu-${operator.sid}`}
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
                <TableCell>Description</TableCell>
                <TableCell>Friendly Name</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Operator Type</TableCell>
                <TableCell>Availability</TableCell>
                <TableCell>Config</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attachedOperators.map((operator) => (
                <TableRow key={operator.sid}>
                  <TableCell>{operator.description}</TableCell>
                  <TableCell>{operator.friendlyName}</TableCell>
                  <TableCell>{operator.author}</TableCell>
                  <TableCell>{operator.operatorType}</TableCell>
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
                    <IconButton
                      aria-label="more"
                      aria-controls={`attached-menu-${operator.sid}`}
                      aria-haspopup="true"
                      onClick={(event) =>
                        handleAttachedMenuOpen(event, operator)
                      }
                    >
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      id={`attached-menu-${operator.sid}`}
                      anchorEl={anchorElAttached}
                      keepMounted
                      open={Boolean(anchorElAttached)}
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
      <Box mt={4}>
        <Typography variant="h4" component="h2" gutterBottom>
          Unattached Operators
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Availability</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {unattachedOperators.map((operator) => (
                <TableRow key={operator.sid}>
                  <TableCell>{operator.description}</TableCell>
                  <TableCell>{operator.author}</TableCell>
                  <TableCell>{operator.availability}</TableCell>
                  <TableCell>
                    <IconButton
                      aria-label="more"
                      aria-controls={`unattached-menu-${operator.sid}`}
                      aria-haspopup="true"
                      onClick={(event) =>
                        handleUnattachedMenuOpen(event, operator)
                      }
                    >
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      id={`unattached-menu-${operator.sid}`}
                      anchorEl={anchorElUnattached}
                      keepMounted
                      open={Boolean(anchorElUnattached)}
                      onClose={handleUnattachedMenuClose}
                    >
                      <MenuItem
                        onClick={() => handleAttach(selectedUnattachedOperator)}
                      >
                        Attach to Selected Service
                      </MenuItem>
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
