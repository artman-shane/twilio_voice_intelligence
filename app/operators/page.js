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
  const [loadingText, setLoadingText] = useState("Loading.");
  const [isLoading, setIsLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOperator, setSelectedOperator] = useState(null);
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

  useEffect(() => {
    fetchOperators();
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

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Operators
      </Typography>
      {isLoading ? (
        <Typography variant="h6" color="textSecondary">
          Loading<span>{loadingText.slice(7)}</span>
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <StyledTable>
            <StyledTableHead>
              <TableRow>
                <StyledTableCell>Description</StyledTableCell>
                <StyledTableCell>Author</StyledTableCell>
                <StyledTableCell>Availability</StyledTableCell>
                <StyledTableCell>Version</StyledTableCell>
                <StyledTableCell>Actions</StyledTableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {operators.map((operator) => (
                <TableRow key={operator.sid}>
                  <StyledTableCell>{operator.description}</StyledTableCell>
                  <StyledTableCell>{operator.author}</StyledTableCell>
                  <StyledTableCell>{operator.availability}</StyledTableCell>
                  <StyledTableCell>{operator.version}</StyledTableCell>
                  <StyledTableCell>
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
                      {(selectedOperator &&
                        selectedOperator.author !== "Twilio" && (
                          <MenuItem onClick={handleDelete}>Delete</MenuItem>
                        )) || <MenuItem>No Actions</MenuItem>}
                    </Menu>
                  </StyledTableCell>
                </TableRow>
              ))}
            </TableBody>
          </StyledTable>
        </TableContainer>
      )}
    </Container>
  );
}
