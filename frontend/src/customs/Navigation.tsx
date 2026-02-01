import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItemText, ListItemButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';


//custom imports
import { useAuth } from '../context/AuthContext';


export const Navigation: React.FC = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const navigate = useNavigate();

    const { isLoggedIn, logout } = useAuth();

    const toggleDrawer = () => setDrawerOpen(!drawerOpen);

    const handleLogout = () => {
        logout(); // update auth context
        navigate('/');
        navigate(0);
    };

    return (
        <>
            {/* --- App Bar --- */}
            <AppBar 

                // levitating effect
                position="absolute" 

                // no shadow
                elevation={0}
                
                sx={{
                    // full width and fixed at top
                    width: '100%',
                    top: 0,
                    zIndex: 50, // index above other content

                    // transparent background
                    backgroundColor: 'rgba(255, 255, 255, 0.0)',
                    
                    // glassmorphism effect
                    backdropFilter: 'blur(5px)',
                    WebkitBackdropFilter: 'blur(5px)', // safari support

                    marginBottom: '10rem',
                    
                    // text color
                    color: '#ffffffff', 
                    
                    //borderBottom: '1px solid rgba(255, 255, 255, 0.3)', // == to discuss

                    height: { xs: '56px', md: '64px' },
                }}
            >
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                        📚 Your Virtual Book Collection
                    </Typography>

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

                    <IconButton color="inherit" onClick={toggleDrawer} sx={{ display: { xs: 'block', md: 'none' } }}>
                        <MenuIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            {/* --- Drawer --- */}
            <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer}
            slotProps={{ 
                paper: {
                    sx: {
                        width: 150,
                        backgroundColor: 'background.default',
                        color: 'text.primary',
                    }
                } 
            }}>
                <List>
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