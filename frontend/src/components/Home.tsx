import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// MUI imports
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import CssBaseline from '@mui/material/CssBaseline';
import { styled, ThemeProvider } from '@mui/material/styles';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

// Custom imports
import ColorModeSelect from '../customs/ColorModeSelect';
import mainTheme from '../themes/mainTheme';

const HomeContainer = styled(Stack)(({ theme }) => ({
    minHeight: '100vh',
    padding: theme.spacing(4),
    [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(6),
    },
    '&::before': {
        content: '""',
        display: 'block',
        position: 'absolute',
        zIndex: -1,
        inset: 0,
        backgroundImage: 'radial-gradient(ellipse at 50% 50%, #be6a0440 0%, #ffe7b8ff 100%)',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
    },
}));

const ActionCard = styled(MuiCard)(({ theme }) => ({
    height: '100%',
    minHeight: '200px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: theme.spacing(2),
    cursor: 'pointer',
    backgroundColor: theme.palette.background.paper,
    border: '1px solid',
    borderColor: theme.palette.divider,
    boxShadow: 'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: 'hsla(220, 30%, 5%, 0.1) 0px 15px 25px 0px',
        borderColor: theme.palette.primary.main,
    },
}));

export default function Home() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is logged in based on auth token
        //setIsLoggedIn(true); //Tymczasowo symuluj stan zalogowania
        setIsLoggedIn(!!localStorage.getItem('authToken'));
    }, []);

    const handleCardClick = (path: string) => {
        navigate(path);
    };

    return (
        <ThemeProvider theme={mainTheme}>
            <CssBaseline enableColorScheme />
            <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 10 }} />
            
            <HomeContainer>
                {/* App Description */}
                <Box sx={{ mb: 4, width: '100%', maxWidth: '1200px', mx: 'auto', textAlign: 'center' }}>
                    <Typography 
                        component="h1" 
                        variant="h4" 
                        sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}
                    >
                        <AutoStoriesIcon fontSize="large" color="primary" />
                        Welcome to Your Virtual Book Collection 📚
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Create your own shelves that are collections of books and place books on them. Organize your reading journey effortlessly!
                    </Typography>
                </Box>

                {/* Action Cards */}
                <Box sx={{ width: '100%', maxWidth: '1200px', mx: 'auto' }}>
                    <Grid container spacing={3} justifyContent="center">
                        {isLoggedIn ? (
                            <>
                                {/* Logged In: Dashboard and Shelves */}
                                 <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <ActionCard onClick={() => handleCardClick('/dashboard')}>
                                        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                            <DashboardIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                                            <Typography variant="h6" color="textPrimary" sx={{ fontWeight: 'bold' }}>
                                                Go to Dashboard
                                            </Typography>
                                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                                Manage your shelves and books
                                            </Typography>
                                        </CardContent>
                                    </ActionCard>
                                </Grid>
                            </>
                        ) : (
                            <>
                                {/* Not Logged In: Login and Register */}
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <ActionCard onClick={() => handleCardClick('/login')}>
                                        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                            <LoginIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                                            <Typography variant="h6" color="textPrimary" sx={{ fontWeight: 'bold' }}>
                                                Login
                                            </Typography>
                                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                                Access your account
                                            </Typography>
                                        </CardContent>
                                    </ActionCard>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <ActionCard onClick={() => handleCardClick('/register')}>
                                        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                            <PersonAddIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                                            <Typography variant="h6" color="textPrimary" sx={{ fontWeight: 'bold' }}>
                                                Register
                                            </Typography>
                                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                                Create an account
                                            </Typography>
                                        </CardContent>
                                    </ActionCard>
                                </Grid>
                            </>
                        )}
                    </Grid>
                </Box>
            </HomeContainer>
        </ThemeProvider>
    );
}