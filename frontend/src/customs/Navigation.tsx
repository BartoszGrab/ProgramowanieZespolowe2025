import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';

export const Navigation: React.FC = () => {
    return (

<AppBar position="static" color="primary" sx={{ height: '64px', 
    background: 'linear-gradient(90deg, #DD980A 0%, #BE6904 100%)'
 }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                📚 Your Virtual Library 
            </Typography>
            <Button color="inherit" href="/">Home</Button>
            <Button color="inherit" href="/login">Login</Button>
            <Button color="inherit" href="/register">Register</Button>
          </Toolbar>
</AppBar>
    );
};