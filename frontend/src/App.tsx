import { useState } from 'react'
// import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Button, Typography, Container } from '@mui/material';
import Register from './components/Register'
import Login from './components/Login'

// <<Route path="/dashboard" element={<Dashboard />} /> will be added after implementing dashboard component

function App() {

  return (
  <div>
  <BrowserRouter>
     <Routes>
        {<Route path="/login" element={<Login />} /> }
        <Route path="/register" element={<Register />} />
      </Routes>
  </BrowserRouter>
  <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Witaj w MUI!
      </Typography>
      <Button variant="contained" color="primary">
        Kliknij mnie
      </Button>
    </Container>
  </div>
  )
}

export default App
