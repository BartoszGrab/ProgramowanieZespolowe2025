import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItemText, ListItemButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

// Custom imports
import { useAuth } from '../context/AuthContext';



/**
 * The main navigation component for the application.
 * It features a transparent "glassmorphism" design that overlays the content.
 * It is responsive: displaying a button row on desktop and a hamburger menu drawer on mobile.
 */
export const Navigation: React.FC = () => {
    // State to control the visibility of the side drawer on mobile devices.
    const [drawerOpen, setDrawerOpen] = useState(false);
    
    // Hook for programmatic navigation.
    const navigate = useNavigate();

    // Access authentication state and logout function from the context.
    const { isLoggedIn, logout } = useAuth();

    /**
     * Toggles the mobile drawer open or closed.
     */
    const toggleDrawer = () => setDrawerOpen(!drawerOpen);

    /**
     * Handles the logout process.
     * 1. Calls the context logout function to clear the token.
     * 2. Navigates to the home page.
     * 3. Forces a page refresh to ensure all states are reset.
     */
    const handleLogout = () => {
        logout(); // update auth context
        navigate('/');
        navigate(0);
    };

    return (
        <>
            {/* --- App Bar --- */}
            <AppBar 
                // 'absolute' position allows the navbar to overlay the hero image/content below it.
                position="absolute" 

                // Removes the default Material UI drop shadow for a flatter look.
                elevation={0}
                
                sx={{
                    // Ensure the navbar spans the full width and stays at the top.
                    width: '100%',
                    top: 0,
                    zIndex: 50, // Ensures the navbar sits above other content (like hero images).

                    // Transparent background to allow content to show through.
                    backgroundColor: 'rgba(255, 255, 255, 0.0)',
                    
                    // Glassmorphism effect: blurs the content behind the navbar.
                    backdropFilter: 'blur(5px)',
                    WebkitBackdropFilter: 'blur(5px)', // Safari/iOS support.

                    // Adds spacing below the navbar to push content down if needed (though position is absolute).
                    marginBottom: '10rem',
                    
                    // Sets the text color to white with full opacity.
                    color: '#ffffffff', 
                    
                    // borderBottom: '1px solid rgba(255, 255, 255, 0.3)', // == to discuss (Optional border)

                    // Responsive height: smaller on mobile (xs), standard on desktop (md).
                    height: { xs: '56px', md: '64px' },
                }}
            >
                <Toolbar>
                    {/* Brand / Logo Section */}
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                        📚 Your Virtual Book Collection
                    </Typography>

                    {/* --- Desktop Menu --- */}
                    {/* The 'sx={{ display: { xs: 'none', md: 'block' } }}' prop hides these buttons on mobile screens. */}
                    <Button color="inherit" href="/" sx={{ display: { xs: 'none', md: 'block' } }}>Home</Button>
                    
                    {/* Conditional rendering based on login status */}
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

                    {/* --- Mobile Menu Button (Hamburger) --- */}
                    {/* Shows only on small screens (xs), hidden on desktop (md). */}
                    <IconButton color="inherit" onClick={toggleDrawer} sx={{ display: { xs: 'block', md: 'none' } }}>
                        <MenuIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            {/* --- Mobile Drawer --- */}
            {/* Slides in from the right side of the screen. */}
            <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer}
            slotProps={{ 
                paper: {
                    sx: {
                        width: 150, // Fixed width for the side menu
                        backgroundColor: 'background.default',
                        color: 'text.primary',
                    }
                } 
            }}>
                <List>
                    <ListItemButton component="a" href="/">
                        <ListItemText primary="Home" />
                    </ListItemButton>
                    
                    {/* Conditional rendering for Mobile Menu */}
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