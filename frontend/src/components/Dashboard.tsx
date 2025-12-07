// /dashboard
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// MUI imports
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid'; 
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import CssBaseline from '@mui/material/CssBaseline';
import { styled, ThemeProvider } from '@mui/material/styles';
import AutoStoriesIcon from '@mui/icons-material/AutoStories'; // Ikona książki/półki

// Custom imports
import ColorModeSelect from '../customs/ColorModeSelect';
import mainTheme from '../themes/mainTheme';

// Typ danych dla półki (dostosuj do swojego API)
interface Shelf {
    id: string | number;
    name: string;
    description?: string;
    bookCount?: number; // Opcjonalnie: liczba książek na półce
}

// 1. Kontener tła - identyczny jak w Register dla spójności
const DashboardContainer = styled(Stack)(({ theme }) => ({
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
        backgroundAttachment: 'fixed', // Ważne przy scrollowaniu dużej ilości półek
    },
}));

// 2. Karta Półki - stylizowana podobnie do karty rejestracji, ale interaktywna
const ShelfCard = styled(MuiCard)(({ theme }) => ({
    height: '100%',
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

export default function Dashboard() {
    const [shelves, setShelves] = useState<Shelf[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Pobieranie danych z API
    useEffect(() => {
        const fetchShelves = async () => {
            try {
                // Symulacja opóźnienia (opcjonalne, do usunięcia)
                // await new Promise(resolve => setTimeout(resolve, 800)); 
                
                const response = await axios.get('/api/shelves');
                // Zakładam, że API zwraca tablicę obiektów lub obiekt z polem shelves
                console.log("Co zwraca API:", response.data); 
                console.log("Typ danych:", typeof response.data);
                console.log("Czy to tablica?:", Array.isArray(response.data));

                // Dostosuj: response.data lub response.data.shelves
                setShelves(response.data); 
            } catch (err: any) {
                console.error('Error fetching shelves:', err);
                setError('Could not load your library shelves. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchShelves();
    }, []);

    const handleShelfClick = (shelfId: string | number) => {
        navigate(`/shelves/${shelfId}`);
    };

    return (
        <ThemeProvider theme={mainTheme}>
            <CssBaseline enableColorScheme />
            <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 10 }} />
            
            <DashboardContainer>
                {/* Header sekcji */}
                <Box sx={{ mb: 4, width: '100%', maxWidth: '1200px', mx: 'auto' }}>
                    <Typography 
                        component="h1" 
                        variant="h4" 
                        sx={{ 
                            fontWeight: 'bold', 
                            color: 'text.primary',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2
                        }}
                    >
                        <AutoStoriesIcon fontSize="large" color="primary" />
                        My Library
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                        Select a shelf to view your collection.
                    </Typography>
                </Box>

                {/* Główna zawartość */}
                <Box sx={{ width: '100%', maxWidth: '1200px', mx: 'auto' }}>
                    
                    {isLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                            <CircularProgress />
                        </Box>
                    )}

                    {error && (
                        <Alert severity="error" sx={{ mb: 4 }}>
                            {error}
                        </Alert>
                    )}

                    {!isLoading && !error && shelves.length === 0 && (
                        <Box sx={{ textAlign: 'center', mt: 8 }}>
                            <Typography variant="h6" color="text.secondary">
                                You don't have any shelves yet.
                            </Typography>
                        </Box>
                    )}

                    {!isLoading && !error && shelves.length > 0 && (
                        <Grid container spacing={3}>
                            {shelves.map((shelf) => (
                                <Grid size={{xs: 12, sm: 6, md: 4, lg: 3 }} key={shelf.id}>
                                    <ShelfCard onClick={() => handleShelfClick(shelf.id)}>
                                        <CardContent>
                                            <Typography 
                                                variant="h6" 
                                                component="div" 
                                                sx={{ fontWeight: 'bold', mb: 1 }}
                                            >
                                                {shelf.name}
                                            </Typography>
                                            
                                            {shelf.description && (
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                    {shelf.description}
                                                </Typography>
                                            )}

                                            <Box 
                                                sx={{ 
                                                    mt: 2, 
                                                    py: 0.5, 
                                                    px: 1.5, 
                                                    bgcolor: 'action.hover', 
                                                    borderRadius: 1,
                                                    display: 'inline-block'
                                                }}
                                            >
                                                <Typography variant="caption" fontWeight="bold" color="primary">
                                                    {shelf.bookCount !== undefined ? `${shelf.bookCount} Books` : 'View Books'}
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </ShelfCard>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            </DashboardContainer>
        </ThemeProvider>
    );
}