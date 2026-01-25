import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItemText, ListItemButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

/**
 * Navigation component providing a responsive app bar with navigation links.
 * Includes a hamburger menu for mobile devices and handles user authentication state.
 */
export const Navigation: React.FC = () => {
     // --- State: Drawer and Authentication ---
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    /**
     * Effect: Check login status on component mount and listen for storage changes.
     * Updates isLoggedIn state based on presence of authToken in localStorage.
     */
    useEffect(() => {
        const checkLogin = () => {
            setIsLoggedIn(!!localStorage.getItem('authToken'));
            //setIsLoggedIn(true); // For testing purposes only
        };
        checkLogin();

        // Listen for storage changes (e.g., logout in another tab)
        window.addEventListener('storage', checkLogin);
        return () => window.removeEventListener('storage', checkLogin);
    }, []);

    /**
     * Toggles the mobile drawer open/closed state.
     */
    const toggleDrawer = () => setDrawerOpen(!drawerOpen);

    /**
     * Handles user logout by clearing the auth token, updating state, and navigating to home.
     */
    const handleLogout = () => {
        localStorage.removeItem('authToken'); // Clear token
        setIsLoggedIn(false);
        navigate('/'); // Navigate to home
    };

    return (
        <>
        {/* --- App Bar --- */}
            <AppBar position="static" sx={{
                height: { xs: '56px', md: '64px' },
                background: 'linear-gradient(90deg, #DD980A 0%, #BE6904 100%)'
            }}>
                <Toolbar>
                    {/* App Title */}
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                        📚 Your Virtual Book Collection
                    </Typography>

                    {/* Buttons visible on md+ screens */}
                    <Button color="inherit" href="/" sx={{ display: { xs: 'none', md: 'block' } }}>Home</Button>
                    {isLoggedIn ? (
                        <>
                            <Button color="inherit" href="/dashboard" sx={{ display: { xs: 'none', md: 'block' } }}>Dashboard</Button>
                            <Button color="inherit" href="/profile" sx={{ display: { xs: 'none', md: 'block' } }}>My Profile</Button>
                            <Button color="inherit" onClick={handleLogout} sx={{ display: { xs: 'none', md: 'block' } }}>Logout</Button>
                        </>
                    ) : (
                        <>
                            <Button color="inherit" href="/login" sx={{ display: { xs: 'none', md: 'block' } }}>Login</Button>
                            <Button color="inherit" href="/register" sx={{ display: { xs: 'none', md: 'block' } }}>Register</Button>
                        </>
                    )}

                    {/* Hamburger menu for xs screens */}
                    <IconButton color="inherit" onClick={toggleDrawer} sx={{ display: { xs: 'block', md: 'none' } }}>
                        <MenuIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            {/* --- Drawer for Mobile Navigation --- */}
            <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer}>
                <List sx={{ width: 250 }}>
                    <ListItemButton component="a" href="/">
                        <ListItemText primary="Home" />
                    </ListItemButton>
                    {isLoggedIn ? (
                        <>
                            <ListItemButton component="a" href="/dashboard">
                                <ListItemText primary="Dashboard" />
                            </ListItemButton>
                            <ListItemButton component="a" href="/profile">
                                <ListItemText primary="My Profile" />
                            </ListItemButton>
                            <ListItemButton onClick={handleLogout}>
                                <ListItemText primary="Logout" />
                            </ListItemButton>
                        </>
                    ) : (
                        <>
                            <ListItemButton component="a" href="/login">
                                <ListItemText primary="Login" />
                            </ListItemButton>
                            <ListItemButton component="a" href="/register">
                                <ListItemText primary="Register" />
                            </ListItemButton>
                        </>
                    )}
                </List>
            </Drawer>
        </>
    );
};