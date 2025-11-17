import { useState } from 'react'
// import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Button, Typography, Container } from '@mui/material';
import Register from './components/Register'
import Login from './components/Login'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

// <<Route path="/dashboard" element={<Dashboard />} /> will be added after implementing dashboard component
const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}> 
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}> {/* Globalny wrapper dla tła */}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              <Container maxWidth="sm" sx={{ py: 4 }}>
                <Typography variant="h4" gutterBottom>
                  Witaj w MUI!
                </Typography>
                <Button variant="contained" color="primary">
                  Kliknij mnie
                </Button>
              </Container>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </BrowserRouter>
      </Box>
    </ThemeProvider>
  );
}


export default App
