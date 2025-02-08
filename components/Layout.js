import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import Link from 'next/link';

const Layout = ({ children }) => {
  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Voice Intelligence Transcription
          </Typography>
          <Button color="inherit" component={Link} href="/">
            Home
          </Button>
          <Button color="inherit" component={Link} href="/upload_media">
            Upload Media
          </Button>
          <Button color="inherit" component={Link} href="/config">
            Configuration
          </Button>
        </Toolbar>
      </AppBar>
      <Container style={{ marginTop: 24 }}>
        {children}
      </Container>
    </div>
  );
};

export default Layout;