import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Drawer, List, ListItem, ListItemText, ListItemButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu'; // Dodaj import ikony

export const Navigation: React.FC = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);

    const toggleDrawer = () => setDrawerOpen(!drawerOpen);

    return (
        <>
            <AppBar position="static" sx={{ 
                height: { xs: '56px', md: '64px' }, // Niższa na mobilnych
                background: 'linear-gradient(90deg, #DD980A 0%, #BE6904 100%)'
            }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                        📚 Your Virtual Book Collection 
                    </Typography>
                    {/* Przyciski widoczne na md+ */}
                    <Button color="inherit" href="/" sx={{ display: { xs: 'none', md: 'block' } }}>Home</Button>
                    <Button color="inherit" href="/login" sx={{ display: { xs: 'none', md: 'block' } }}>Login</Button>
                    <Button color="inherit" href="/register" sx={{ display: { xs: 'none', md: 'block' } }}>Register</Button>
                    {/* Hamburger na xs */}
                    <IconButton color="inherit" onClick={toggleDrawer} sx={{ display: { xs: 'block', md: 'none' } }}>
                        <MenuIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            {/* Drawer dla mobilnych */}
            <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer}>
                <List sx={{ width: 250 }}>
                    <ListItemButton component="a" href="/">
                        <ListItemText primary="Home" />
                    </ListItemButton>
                    <ListItemButton component="a" href="/login">
                        <ListItemText primary="Login" />
                    </ListItemButton>
                    <ListItemButton component="a" href="/register">
                        <ListItemText primary="Register" />
                    </ListItemButton>
                </List>
            </Drawer>
        </>
    );
};