import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItemText, ListItemButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

export const Navigation: React.FC = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkLogin = () => {
            setIsLoggedIn(!!localStorage.getItem('authToken'));
        };
        checkLogin();
        window.addEventListener('storage', checkLogin);
        return () => window.removeEventListener('storage', checkLogin);
    }, []);

    const toggleDrawer = () => setDrawerOpen(!drawerOpen);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setIsLoggedIn(false);
        navigate('/');
    };

    return (
        <>
            {/* --- App Bar --- */}
            <AppBar 
                // Używamy 'static' lub 'fixed' w zależności od potrzeb, ale 'absolute'
                // sprawia, że pasek leży NA obrazku, a nie przesuwa go w dół.
                position="absolute" 
                
                // Resetujemy domyślny cień
                elevation={0}
                
                sx={{
                    // 1. Zapewniamy, że pasek jest na wierzchu i zajmuje całą szerokość
                    width: '100%',
                    top: 0,
                    zIndex: 50, // Wyższy index niż tło

                    // 2. KLUCZOWE: Kolor tła w formacie RGBA
                    // 255,255,255 = biały
                    // 0.8 = 80% widoczności (możesz zmienić na 0.5, 0.9 itp.)
                    backgroundColor: 'rgba(255, 255, 255, 0.0)',
                    
                    // 3. EFEKT ROZMYCIA (Glassmorphism)
                    backdropFilter: 'blur(5px)',
                    WebkitBackdropFilter: 'blur(5px)', // Wsparcie dla Safari

                    marginBottom: '10rem',
                    
                    // 4. Kolor tekstu (ciemny szary, żeby był czytelny na białym)
                    color: '#ffffffff', // odpowiednik text-slate-800
                    
                    // 5. Delikatna ramka na dole dla lepszego kontrastu (opcjonalne)
                    //borderBottom: '1px solid rgba(255, 255, 255, 0.3)',

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