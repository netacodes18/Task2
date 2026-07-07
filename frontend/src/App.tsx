import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Button } from '@mui/material';
import { Upload, MessageSquare } from 'lucide-react';
import UploadPage from './pages/UploadPage';
import ChatPage from './pages/ChatPage';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <AppBar position="static" color="primary" elevation={1}>
          <Toolbar>
            <Typography 
              variant="h6" 
              component={Link} 
              to="/"
              sx={{ flexGrow: 1, fontWeight: 'bold', textDecoration: 'none', color: 'inherit' }}
            >
              DataChat AI
            </Typography>
            <Button color="inherit" component={Link} to="/" startIcon={<Upload size={18} />}>
              Datasets
            </Button>
            <Button color="inherit" component={Link} to="/chat" startIcon={<MessageSquare size={18} />}>
              Chat
            </Button>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chat/:datasetId" element={<ChatPage />} />
          </Routes>
        </Container>
      </div>
    </BrowserRouter>
  );
}

export default App;
