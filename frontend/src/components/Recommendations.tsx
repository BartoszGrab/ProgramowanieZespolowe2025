import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

// MUI imports
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import CssBaseline from '@mui/material/CssBaseline';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { styled, ThemeProvider } from '@mui/material/styles';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

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
    minHeight: '350px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
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

const EmptyStateBox = styled(Box)(({ theme }) => ({
    textAlign: 'center',
    padding: theme.spacing(8),
    backgroundColor: theme.palette.background.paper,
    borderRadius: (theme.shape.borderRadius as number) * 2,
    border: '2px dashed',
    borderColor: theme.palette.divider,
}));

export default function Recommendations() {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [recommendations, setRecommendations] = useState<RecommendationCategory[]>([]);
    const [hasBooks, setHasBooks] = useState<boolean>(false);
    const navigate = useNavigate();

    // Add to shelf dialog state
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState<RecommendedBook | null>(null);
    const [shelves, setShelves] = useState<Shelf[]>([]);
    const [selectedShelfId, setSelectedShelfId] = useState<string | number>('');
    const [isAdding, setIsAdding] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);
    const [addSuccess, setAddSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetchRecommendations();
        fetchShelves();
    }, []);

    const fetchShelves = async () => {
        try {
            const response = await axios.get<Shelf[]>('/api/shelves');
            setShelves(response.data);
        } catch (err) {
            console.error('Failed to fetch shelves:', err);
        }
    };

    const fetchRecommendations = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Step 1: Get all shelves
            const shelvesResponse = await axios.get<Shelf[]>('/api/shelves');
            const shelvesData = shelvesResponse.data;

            console.log('Shelves response:', shelvesData);

            if (!shelvesData || shelvesData.length === 0) {
                setHasBooks(false);
                setIsLoading(false);
                return;
            }

            // Step 2: Get books from each shelf
            const allBooks: ShelfBookDto[] = [];
            for (const shelf of shelvesData) {
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
                rating: Math.round(book.averageRating || 4)
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

    const handleBookClick = (book: RecommendedBook) => {
        setSelectedBook(book);
        setSelectedShelfId('');
        setAddError(null);
        setAddSuccess(null);
        setAddDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setAddDialogOpen(false);
        setSelectedBook(null);
        setAddError(null);
        setAddSuccess(null);
    };

    const handleAddToShelf = async () => {
        if (!selectedBook || !selectedShelfId) return;

        setIsAdding(true);
        setAddError(null);
        setAddSuccess(null);

        try {
            // Search for the book in the database or Google Books
            const searchQuery = `${selectedBook.title} ${selectedBook.author}`;
            const searchResponse = await axios.get(`/api/books?search=${encodeURIComponent(searchQuery)}`);

            let bookToAdd = null;

            if (searchResponse.data && searchResponse.data.length > 0) {
                // Find best match by title
                bookToAdd = searchResponse.data.find((b: any) =>
                    b.title.toLowerCase().includes(selectedBook.title.toLowerCase()) ||
                    selectedBook.title.toLowerCase().includes(b.title.toLowerCase())
                ) || searchResponse.data[0];
            }

            if (!bookToAdd) {
                setAddError(`Could not find "${selectedBook.title}" in the library. Try searching for it manually on the shelf page.`);
                return;
            }

            // Add to shelf
            const hasValidId = bookToAdd.id && bookToAdd.id !== '00000000-0000-0000-0000-000000000000';
            const gId = bookToAdd.googleBookId || bookToAdd.GoogleBookId;

            let payload: any = {};
            if (hasValidId) {
                payload = { bookId: bookToAdd.id };
            } else if (gId) {
                payload = { googleBookId: gId };
            } else if (bookToAdd.isbn) {
                payload = { isbn: bookToAdd.isbn };
            } else {
                setAddError('Could not identify the book. Please add it manually.');
                return;
            }

            await axios.post(`/api/shelves/${selectedShelfId}/books`, payload);

            setAddSuccess(`"${selectedBook.title}" has been added to your shelf!`);

            // Close dialog after a short delay
            setTimeout(() => {
                handleCloseDialog();
            }, 1500);

        } catch (err: any) {
            console.error('Failed to add book to shelf:', err);
            const msg = err.response?.data?.message ||
                (typeof err.response?.data === 'string' ? err.response?.data :
                    err.message || 'Failed to add book. Please try again.');
            setAddError(msg);
        } finally {
            setIsAdding(false);
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
                        Personalized suggestions based on your reading history. Click on a book to add it to your shelf!
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
                                        <BookCard onClick={() => handleBookClick(book)}>
                                            {/* Book Cover Placeholder */}
                                            <CardMedia
                                                sx={{
                                                    height: 150,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: '#f5f5f5',
                                                    borderRadius: 1,
                                                    mb: 2
                                                }}
                                            >
                                                <MenuBookIcon sx={{ fontSize: 60, color: 'text.disabled' }} />
                                            </CardMedia>

                                            <CardContent sx={{ flexGrow: 1, p: 0 }}>
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        mb: 0.5,
                                                        fontSize: '1rem',
                                                        lineHeight: 1.2,
                                                        display: '-webkit-box',
                                                        overflow: 'hidden',
                                                        WebkitBoxOrient: 'vertical',
                                                        WebkitLineClamp: 2,
                                                    }}
                                                >
                                                    {book.title}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                    by {book.author}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontStyle: 'italic',
                                                        fontSize: '0.8rem',
                                                        display: '-webkit-box',
                                                        overflow: 'hidden',
                                                        WebkitBoxOrient: 'vertical',
                                                        WebkitLineClamp: 2,
                                                        color: 'text.secondary'
                                                    }}
                                                >
                                                    "{book.reason}"
                                                </Typography>
                                            </CardContent>

                                            <Box sx={{ mt: 'auto', pt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                {book.match_score && (
                                                    <Chip
                                                        label={`${Math.round(book.match_score * 100)}% match`}
                                                        size="small"
                                                        color="success"
                                                    />
                                                )}
                                                <Chip
                                                    icon={<AddCircleOutlineIcon />}
                                                    label="Click to add to shelf"
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            </Box>
                                        </BookCard>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    ))}
                </Box>
            </PageContainer>

            {/* Add to Shelf Dialog */}
            <Dialog open={addDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Add to Shelf
                </DialogTitle>
                <DialogContent>
                    {selectedBook && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                {selectedBook.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                by {selectedBook.author}
                            </Typography>
                        </Box>
                    )}

                    {addError && <Alert severity="error" sx={{ mb: 2 }}>{addError}</Alert>}
                    {addSuccess && <Alert severity="success" sx={{ mb: 2 }}>{addSuccess}</Alert>}

                    <FormControl fullWidth>
                        <InputLabel id="shelf-select-label">Select Shelf</InputLabel>
                        <Select
                            labelId="shelf-select-label"
                            value={selectedShelfId}
                            label="Select Shelf"
                            onChange={(e) => setSelectedShelfId(e.target.value)}
                            disabled={isAdding || !!addSuccess}
                        >
                            {shelves.map((shelf) => (
                                <MenuItem key={shelf.id} value={shelf.id}>
                                    {shelf.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {shelves.length === 0 && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            You don't have any shelves yet. Create one first on the Dashboard.
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={handleCloseDialog} color="inherit" disabled={isAdding}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleAddToShelf}
                        disabled={!selectedShelfId || isAdding || !!addSuccess}
                    >
                        {isAdding ? 'Adding...' : 'Add to Shelf'}
                    </Button>
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    );
}
