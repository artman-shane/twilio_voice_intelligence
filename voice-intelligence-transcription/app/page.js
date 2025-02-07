'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Typography, Container, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

export default function Home() {
  const [fileList, setFileList] = useState([]);
  const [loadingText, setLoadingText] = useState('Loading.');
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const router = useRouter();

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      const services = await response.json();
      setServices(services);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchTranscripts = async () => {
    try {
      const response = await fetch('/api/transcripts');
      if (!response.ok) {
        throw new Error('Failed to fetch transcripts');
      }
      const data = await response.json();
      const transcriptsWithServiceNames = data.map(transcript => {
        const service = services.find(service => service.sid === transcript.serviceSid);
        return {
          ...transcript,
          serviceFriendlyName: service ? service.friendlyName : transcript.serviceSid,
        };
      });
      console.log('Transcripts with service names:', transcriptsWithServiceNames); // Debugging
      setFileList(transcriptsWithServiceNames);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching transcripts:', error);
    }
  };

  useEffect(() => {
    const checkCredentials = async () => {
      const response = await fetch('/api/config');
      const data = await response.json();
      if (!data.accountSid || !data.authToken) {
        router.push('/config');
      } else {
        await fetchServices();
        await fetchTranscripts();
      }
    };

    checkCredentials();
  }, [router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingText((prev) => {
        if (prev === 'Loading.') return 'Loading..';
        if (prev === 'Loading..') return 'Loading...';
        return 'Loading.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleMenuOpen = (event, file) => {
    setAnchorEl(event.currentTarget);
    setSelectedFile(file);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFile(null);
  };

  const handleDelete = async () => {
    if (!selectedFile) return;
    const response = await fetch('/api/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transcriptSid: selectedFile.sid, fileName: selectedFile.name }),
    });

    if (response.ok) {
      await fetchTranscripts(); // Refresh the list of transcripts
      handleMenuClose();
    } else {
      const errorText = await response.text();
      alert(`Error deleting transcript: ${errorText}`);
    }
  };

  const handleOperatorResults = () => {
    if (!selectedFile) return;
    router.push(`/operator_results?transcriptSid=${selectedFile.sid}`);
    handleMenuClose();
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Uploaded Files
      </Typography>
      <Box mb={2}>
        <Button variant="contained" color="primary" onClick={() => router.push('/upload_media')}>
          Upload
        </Button>
      </Box>
      {isLoading ? (
        <Typography variant="h6" color="textSecondary">
          Loading<span>{loadingText.slice(7)}</span>
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>File Name</TableCell>
                <TableCell>SID</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Updated</TableCell>
                <TableCell>Duration (mm:ss)</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fileList.map(file => (
                <TableRow key={file.sid}>
                  <TableCell>{file.name || 'None'}</TableCell>
                  <TableCell>{file.sid}</TableCell>
                  <TableCell>{file.serviceFriendlyName}</TableCell>
                  <TableCell>{new Date(Date.parse(file.dateCreated)).toLocaleString()}</TableCell>
                  <TableCell>{new Date(Date.parse(file.dateUpdated)).toLocaleString()}</TableCell>
                  <TableCell>{formatDuration(file.duration)}</TableCell>
                  <TableCell>
                    <IconButton
                      aria-label="more"
                      aria-controls="long-menu"
                      aria-haspopup="true"
                      onClick={(event) => handleMenuOpen(event, file)}
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
                      <MenuItem onClick={handleOperatorResults}>Operator Results</MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}