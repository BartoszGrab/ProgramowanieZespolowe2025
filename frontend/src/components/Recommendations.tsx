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

/**
 * DTO for a book residing on a shelf.
 */
interface ShelfBookDto {
    /** Unique identifier for the book */
    id: string;
    /** Title of the book */
    title: string;
    /** List of authors of the book */
    authors?: string[];
    /** List of genres associated with the book */
    genres?: string[];
    /** Average rating of the book */
    averageRating?: number;
}

/**
 * DTO for a shelf containing books.
 */
interface ShelfDto {
    /** Unique identifier for the shelf */
    id: string | number;
    /** Name of the shelf */
    name: string;
    /** Total number of books on the shelf */
    bookCount: number;
    /** List of books on the shelf */
    books: ShelfBookDto[];
}

/**
 * Simplified shelf object for selection lists.
 */
interface Shelf {
    id: string | number;
    name: string;
}

/**
 * Represents a single book recommendation returned by the AI service.
 */
interface RecommendedBook {
    title: string;
    author: string;
    /** Explanation for the recommendation */
    reason: string;
    /** Optional match score indicating relevance */
    match_score?: number;
}

/**
 * A category of recommendations (e.g., "Because you read Sci-Fi").
 */
interface RecommendationCategory {
    category_title: string;
    type: string;
    items: RecommendedBook[];
}

/**
 * API response structure for recommendations.
 */
interface RecommendationResponse {
    recommendations: RecommendationCategory[];
}

/**
 * Styled container for the recommendations page layout.
 * Includes responsive padding and a radial gradient background.
 */
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

/**
 * Styled card component for displaying recommended books.
 * Adds hover effects (lift and shadow) for better interactivity.
 */
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

/**
 * Styled container for the empty state message.
 */
const EmptyStateBox = styled(Box)(({ theme }) => ({
    textAlign: 'center',
    padding: theme.spacing(8),
    backgroundColor: theme.palette.background.paper,
    borderRadius: (theme.shape.borderRadius as number) * 2,
    border: '2px dashed',
    borderColor: theme.palette.divider,
}));

/**
 * The Recommendations page component.
 * Analyzes the user's reading history to provide personalized book suggestions.
 * Allows users to add recommended books directly to their shelves.
 */
export default function Recommendations() {
    // --- State: Data Fetching ---
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [recommendations, setRecommendations] = useState<RecommendationCategory[]>([]);
    const [hasBooks, setHasBooks] = useState<boolean>(false);
    const navigate = useNavigate();

    // --- State: Add to Shelf Dialog ---
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState<RecommendedBook | null>(null);
    const [shelves, setShelves] = useState<Shelf[]>([]);
    const [selectedShelfId, setSelectedShelfId] = useState<string | number>('');
    const [isAdding, setIsAdding] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);
    const [addSuccess, setAddSuccess] = useState<string | null>(null);

    /**
     * Initial data fetch on component mount.
     */
    useEffect(() => {
        fetchRecommendations();
        fetchShelves();
    }, []);

    /**
     * Fetches the list of available shelves for the "Add to Shelf" dialog.
     */
    const fetchShelves = async () => {
        try {
            const response = await axios.get<Shelf[]>('/api/shelves');
            setShelves(response.data);
        } catch (err) {
            console.error('Failed to fetch shelves:', err);
        }
    };

    /**
     * Orchestrates the recommendation process:
     * 1. Fetches all user shelves.
     * 2. Aggregates books from all shelves to build a reading history.
     * 3. Sends the history to the recommendation engine.
     */
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

    /**
     * Opens the dialog to add a specific recommended book to a shelf.
     */
    const handleBookClick = (book: RecommendedBook) => {
        setSelectedBook(book);
        setSelectedShelfId('');
        setAddError(null);
        setAddSuccess(null);
        setAddDialogOpen(true);
    };

    /**
     * Closes the "Add to Shelf" dialog and resets selection state.
     */
    const handleCloseDialog = () => {
        setAddDialogOpen(false);
        setSelectedBook(null);
        setAddError(null);
        setAddSuccess(null);
    };

    /**
     * Handles the logic for adding a recommended book to a user's shelf.
     * Since recommendations might not have internal IDs, this function:
     * 1. Searches for the book in the system/Google Books to get a valid ID.
     * 2. Adds the book to the selected shelf using the best available identifier.
     */
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

            // Determine the correct ID payload for the API
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
                {/* --- Section: Header --- */}
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

                {/* --- Section: Content --- */}
                <Box sx={{ width: '100%', maxWidth: '1200px', mx: 'auto' }}>
                    {/* Loading State */}
                    {isLoading && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8, gap: 2 }}>
                            <CircularProgress />
                            <Typography>Analyzing your books and generating recommendations...</Typography>
                        </Box>
                    )}

                    {/* Error State */}
                    {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

                    {/* Empty State: No Books in Library */}
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

                    {/* No Recommendations State */}
                    {!isLoading && !error && hasBooks && recommendations.length === 0 && (
                        <Alert severity="info">
                            We couldn't generate recommendations at this time. Please try again later.
                        </Alert>
                    )}
                    
                    {/* Recommendations Grid */}
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

            {/* --- Dialog: Add to Shelf --- */}
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
