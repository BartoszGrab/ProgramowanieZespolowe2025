import { useState } from 'react'
//import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Button, Typography, Container, AppBar, Toolbar } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import mainTheme from './themes/mainTheme';
import { Navigation } from './customs/Navigation';

import Home from './components/Home';
import Register from './components/Register'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Shelves from './components/Shelves'
import Recommendations from './components/Recommendations'



function App() {
  return (
    <ThemeProvider theme={mainTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/shelves/:id" element={<Shelves />} />
          <Route path="/recommendations" element={<Recommendations />} />
          {/* <Route path="/books/:id" element={<Books />} /> TO DO LATER*/}
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );

}

export default App;
