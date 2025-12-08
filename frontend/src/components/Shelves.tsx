import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { styled, ThemeProvider } from '@mui/material/styles';
import MenuBookIcon from '@mui/icons-material/MenuBook';

// Custom imports
import ColorModeSelect from '../customs/ColorModeSelect';
import mainTheme from '../themes/mainTheme';

interface Book {
    id: string | number;
    title: string;
    author?: string;
    description?: string;
}

interface ShelfData {
    name: string;
    description?: string;
    books: Book[];
}

const ShelvesContainer = styled(Stack)(({ theme }) => ({
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

const BookCard = styled(MuiCard)(({ theme }) => ({
    height: '100%',
    minHeight: '250px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    textAlign: 'center',
    padding: theme.spacing(2),
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

export default function Shelves() {
    const { id } = useParams<{ id: string }>(); // Pobierz ID półki z URL
    const [shelfData, setShelfData] = useState<ShelfData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchShelfBooks = async () => {
            if (!id) return;
            try {
                // Zakładam API: /api/shelves/:id/books, które zwraca { name, description, books: [] }
                const response = await axios.get(`/api/shelves/${id}/books`);
                const data = response.data;
                if (data && data.books) {
                    setShelfData(data);
                } else {
                    setShelfData({ name: 'Unknown Shelf', description: '', books: [] });
                }
            } catch (err: any) {
                console.error('Error fetching shelf books:', err);
                setError('Could not load books for this shelf.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchShelfBooks();
    }, [id]);

    const handleBackToDashboard = () => {
        navigate('/dashboard');
    };

    return (
        <ThemeProvider theme={mainTheme}>
            <CssBaseline enableColorScheme />
            <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 10 }} />
            
            <ShelvesContainer>
                {/* Header */}
                <Box sx={{ mb: 4, width: '100%', maxWidth: '1200px', mx: 'auto' }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={handleBackToDashboard}
                        sx={{ mb: 2 }}
                    >
                        Back to Dashboard
                    </Button>
                    <Typography 
                        component="h1" 
                        variant="h4" 
                        sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2 }}
                    >
                        <MenuBookIcon fontSize="large" color="primary" />
                        Books in {shelfData?.name || 'Shelf'}
                    </Typography>
                    {shelfData?.description && (
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                            {shelfData.description}
                        </Typography>
                    )}
                </Box>

                {/* Grid */}
                <Box sx={{ width: '100%', maxWidth: '1200px', mx: 'auto' }}>
                    {isLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                            <CircularProgress />
                        </Box>
                    )}
                    {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

                    {!isLoading && !error && shelfData && (
                        shelfData.books.length > 0 ? (
                            <Grid container spacing={3}>
                                {shelfData.books.map((book) => (
                                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={book.id}>
                                        <BookCard>
                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                    {book.title}
                                                </Typography>
                                                {book.author && (
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                        by {book.author}
                                                    </Typography>
                                                )}
                                                {book.description && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        {book.description}
                                                    </Typography>
                                                )}
                                            </CardContent>
                                        </BookCard>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Box sx={{ textAlign: 'center', mt: 8 }}>
                                <Typography variant="h6" color="text.secondary">
                                    No books in this shelf yet.
                                </Typography>
                            </Box>
                        )
                    )}
                </Box>
            </ShelvesContainer>
        </ThemeProvider>
    );
}