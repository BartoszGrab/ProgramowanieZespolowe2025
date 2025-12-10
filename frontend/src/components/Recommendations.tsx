import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

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
import Chip from '@mui/material/Chip';
import { styled, ThemeProvider } from '@mui/material/styles';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Custom imports
import ColorModeSelect from '../customs/ColorModeSelect';
import mainTheme from '../themes/mainTheme';

interface ShelfBookDto {
    id: string;
    title: string;
    authors?: string[];
    genres?: string[];
    averageRating?: number;
}

interface ShelfDto {
    id: string | number;
    name: string;
    bookCount: number;
    books: ShelfBookDto[];
}

interface Shelf {
    id: string | number;
    name: string;
}

interface RecommendedBook {
    title: string;
    author: string;
    reason: string;
    match_score?: number;
}

interface RecommendationCategory {
    category_title: string;
    type: string;
    items: RecommendedBook[];
}

interface RecommendationResponse {
    recommendations: RecommendationCategory[];
}

const PageContainer = styled(Stack)(({ theme }) => ({
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
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    border: '1px solid',
    borderColor: theme.palette.divider,
    boxShadow: 'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: 'hsla(220, 30%, 5%, 0.1) 0px 15px 25px 0px',
        borderColor: theme.palette.primary.main,
    },
}));

const EmptyStateBox = styled(Box)(({ theme }) => ({
    textAlign: 'center',
    padding: theme.spacing(8),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius * 2,
    border: '2px dashed',
    borderColor: theme.palette.divider,
}));

export default function Recommendations() {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [recommendations, setRecommendations] = useState<RecommendationCategory[]>([]);
    const [hasBooks, setHasBooks] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Step 1: Get all shelves
            const shelvesResponse = await axios.get<Shelf[]>('/api/shelves');
            const shelves = shelvesResponse.data;

            console.log('Shelves response:', shelves);

            if (!shelves || shelves.length === 0) {
                setHasBooks(false);
                setIsLoading(false);
                return;
            }

            // Step 2: Get books from each shelf
            const allBooks: ShelfBookDto[] = [];
            for (const shelf of shelves) {
                try {
                    const shelfResponse = await axios.get<ShelfDto>(`/api/shelves/${shelf.id}/books`);
                    console.log(`Shelf ${shelf.id} response:`, shelfResponse.data);
                    if (shelfResponse.data && shelfResponse.data.books && Array.isArray(shelfResponse.data.books)) {
                        allBooks.push(...shelfResponse.data.books);
                    }
                } catch (err) {
                    console.warn(`Could not fetch books from shelf ${shelf.id}`, err);
                }
            }

            console.log('All books collected:', allBooks);

            if (allBooks.length === 0) {
                setHasBooks(false);
                setIsLoading(false);
                return;
            }

            setHasBooks(true);

            // Step 3: Prepare history for recommendations API
            const history = allBooks.map(book => ({
                title: book.title,
                author: book.authors?.join(', ') || 'Unknown',
                genre: book.genres?.[0] || 'General',
                rating: book.averageRating || 4
            }));

            console.log('History for recommendations:', history);

            // Step 4: Get recommendations
            const recResponse = await axios.post<RecommendationResponse>('/api/recommendations', {
                preferredLanguage: 'pl',
                history: history
            });

            if (recResponse.data && recResponse.data.recommendations) {
                setRecommendations(recResponse.data.recommendations);
            }

        } catch (err: any) {
            console.error('Error fetching recommendations:', err);
            if (err.response?.status === 503) {
                setError('Recommendation service is currently unavailable. Please make sure the books-rec service is running.');
            } else {
                setError('Could not load recommendations. Please try again later.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ThemeProvider theme={mainTheme}>
            <CssBaseline enableColorScheme />
            <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 10 }} />

            <PageContainer>
                {/* Header */}
                <Box sx={{ mb: 4, width: '100%', maxWidth: '1200px', mx: 'auto' }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/')}
                        sx={{ mb: 2 }}
                    >
                        Back to Home
                    </Button>
                    <Typography
                        component="h1"
                        variant="h4"
                        sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2 }}
                    >
                        <AutoAwesomeIcon fontSize="large" color="primary" />
                        Book Recommendations
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                        Personalized suggestions based on your reading history
                    </Typography>
                </Box>

                {/* Content */}
                <Box sx={{ width: '100%', maxWidth: '1200px', mx: 'auto' }}>
                    {isLoading && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8, gap: 2 }}>
                            <CircularProgress />
                            <Typography>Analyzing your books and generating recommendations...</Typography>
                        </Box>
                    )}

                    {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

                    {!isLoading && !error && !hasBooks && (
                        <EmptyStateBox>
                            <MenuBookIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h5" gutterBottom>
                                No books in your library yet
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                Add some books to your shelves first, and we'll recommend similar titles you might enjoy!
                            </Typography>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate('/dashboard')}
                            >
                                Go to Dashboard
                            </Button>
                        </EmptyStateBox>
                    )}

                    {!isLoading && !error && hasBooks && recommendations.length === 0 && (
                        <Alert severity="info">
                            We couldn't generate recommendations at this time. Please try again later.
                        </Alert>
                    )}

                    {!isLoading && !error && hasBooks && recommendations.map((category, categoryIndex) => (
                        <Box key={categoryIndex} sx={{ mb: 5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                    {category.category_title}
                                </Typography>
                                <Chip label={category.type} size="small" color="primary" variant="outlined" />
                            </Box>
                            <Grid container spacing={3}>
                                {category.items.map((book, bookIndex) => (
                                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={bookIndex}>
                                        <BookCard>
                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                    {book.title}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                    by {book.author}
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                                    "{book.reason}"
                                                </Typography>
                                                {book.match_score && (
                                                    <Chip
                                                        label={`${Math.round(book.match_score * 100)}% match`}
                                                        size="small"
                                                        color="success"
                                                        sx={{ mt: 2 }}
                                                    />
                                                )}
                                            </CardContent>
                                        </BookCard>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    ))}
                </Box>
            </PageContainer>
        </ThemeProvider>
    );
}
