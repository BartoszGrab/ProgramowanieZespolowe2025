import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

// MUI imports (zachowane dla funkcjonalności formularzy i ikon)
import Box from '@mui/material/Box';
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
import { ThemeProvider } from '@mui/material/styles';

// Icons
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

// Custom imports
import mainTheme from '../themes/mainTheme';
import { PageLayout } from './layouts/PageLayout';
import Typography from '@mui/material/Typography';

// --- Interfaces ---

interface ShelfBookDto {
    id: string;
    title: string;
    authors?: string[];
    genres?: string[];
    averageRating?: number;
    coverUrl?: string;
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
    cover_url?: string;
}

interface RecommendationCategory {
    category_title: string;
    type: string;
    items: RecommendedBook[];
}

interface RecommendationResponse {
    recommendations: RecommendationCategory[];
}

/**
 * Komponent karty rekomendowanej książki (Glassmorphism style)
 * Stylizowany Tailwindem, spójny z Dashboard.tsx
 */
const RecommendedBookCard = ({ book, onClick }: { book: RecommendedBook; onClick: () => void }) => (
    <div
        onClick={onClick}
        className={`
            group relative flex flex-col justify-between p-5 cursor-pointer h-full min-h-[320px]
            bg-white/70 backdrop-blur-md
            border border-white/40 rounded-3xl
            shadow-lg hover:shadow-2xl hover:shadow-primary-main/20 hover:-translate-y-2
            transition-all duration-300 ease-out overflow-hidden
        `}
    >
        {/* Dekoracyjne tło hover */}
        <div className="absolute inset-0 bg-linear-to-br from-primary-light/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Content Container */}
        <div className="relative z-10 flex flex-col h-full">

            {/* Cover Image or Placeholder */}
            <div className="flex justify-center items-center h-48 mb-4 bg-gray-100/50 rounded-2xl group-hover:bg-white/60 transition-colors overflow-hidden relative">
                {book.cover_url ? (
                    <img
                        src={book.cover_url}
                        alt={book.title}
                        className="h-full w-auto object-contain shadow-md rounded-md transform group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <MenuBookIcon sx={{ fontSize: 64 }} className="text-gray-400 group-hover:text-primary-main transition-colors" />
                )}
            </div>

            {/* Title & Author */}
            <div className="mb-2 text-center">
                <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2 mb-1">
                    {book.title}
                </h3>
                <p className="text-sm text-gray-600 font-medium">
                    by {book.author}
                </p>
            </div>

            {/* Reason */}
            <div className="mb-4 text-center px-1">
                <p className="text-xs text-gray-500 italic line-clamp-3 leading-relaxed">
                    "{book.reason}"
                </p>
            </div>

            {/* Footer: Match Score & Action */}
            <div className="mt-auto pt-3 border-t border-gray-200/50 flex flex-col gap-2 items-center">
                {book.match_score && (
                    <span className="text-xs font-bold text-green-700 bg-green-100/80 px-2 py-0.5 rounded-full">
                        {Math.round(book.match_score * 100)}% match
                    </span>
                )}

                <div className="flex items-center gap-1 text-primary-main text-sm font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                    <AddCircleOutlineIcon fontSize="small" />
                    <span>Add to shelf</span>
                </div>
            </div>
        </div>
    </div>
);

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
                    if (shelfResponse.data && shelfResponse.data.books && Array.isArray(shelfResponse.data.books)) {
                        allBooks.push(...shelfResponse.data.books);
                    }
                } catch (err) {
                    console.warn(`Could not fetch books from shelf ${shelf.id}`, err);
                }
            }

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
                rating: Math.round(book.averageRating || 4),
                cover_url: book.coverUrl
            }));

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
            const searchQuery = `${selectedBook.title} ${selectedBook.author}`;
            const searchResponse = await axios.get(`/api/books?search=${encodeURIComponent(searchQuery)}`);

            let bookToAdd = null;

            if (searchResponse.data && searchResponse.data.length > 0) {
                bookToAdd = searchResponse.data.find((b: any) =>
                    b.title.toLowerCase().includes(selectedBook.title.toLowerCase()) ||
                    selectedBook.title.toLowerCase().includes(b.title.toLowerCase())
                ) || searchResponse.data[0];
            }

            if (!bookToAdd) {
                setAddError(`Could not find "${selectedBook.title}" in the library.`);
                return;
            }

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

            setTimeout(() => {
                handleCloseDialog();
            }, 1500);

        } catch (err: any) {
            console.error('Failed to add book to shelf:', err);
            const msg = err.response?.data?.message || 'Failed to add book.';
            setAddError(msg);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <ThemeProvider theme={mainTheme}>
            <CssBaseline enableColorScheme />

            {/* PageLayout zarządza tłem i paddingiem */}
            <PageLayout>

                {/* --- Header Section --- */}
                <div className="w-full max-w-7xl mx-auto mb-8 pl-2 animate-fade-in">
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/')}
                        sx={{ mb: 3, color: 'primary.light', '&:hover': { color: 'primary.main' } }}
                    >
                        Back to Home
                    </Button>

                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-sm">
                            <AutoAwesomeIcon sx={{ fontSize: 36 }} className="text-primary-light" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-primary-light tracking-tight drop-shadow-sm">
                                Recommendations
                            </h1>
                            <p className="text-primary-light font-medium text-sm sm:text-base">
                                AI-powered suggestions based on your library
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- Content Section --- */}
                <div className="w-full max-w-7xl mx-auto pb-10">

                    {/* Loading */}
                    {isLoading && (
                        <div className="flex flex-col justify-center items-center mt-20 gap-4">
                            <CircularProgress size={60} thickness={4} sx={{ color: 'white' }} />
                            <p className="text-primary-light font-medium text-lg drop-shadow-md">Analyzing your taste...</p>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <Alert severity="error" className="mb-8 shadow-md rounded-xl backdrop-blur-md bg-red-100/90">
                            {error}
                        </Alert>
                    )}

                    {/* Empty State: No Books */}
                    {!isLoading && !error && !hasBooks && (
                        <div className="flex flex-col items-center justify-center p-12 text-center bg-white/40 backdrop-blur-md rounded-3xl border border-white/40 shadow-xl max-w-2xl mx-auto">
                            <MenuBookIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 3, opacity: 0.5 }} />
                            <h2 className="text-2xl font-bold text-primary-light mb-2">No books in your library yet</h2>
                            <p className="text-primary-light mb-6 max-w-md">
                                Add some books to your shelves first, and we'll recommend similar titles you might enjoy!
                            </p>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate('/dashboard')}
                                sx={{ borderRadius: 2, px: 4 }}
                            >
                                Go to Dashboard
                            </Button>
                        </div>
                    )}

                    {/* No Recommendations found */}
                    {!isLoading && !error && hasBooks && recommendations.length === 0 && (
                        <Alert severity="info" className="shadow-md rounded-xl backdrop-blur-md">
                            We couldn't generate recommendations at this time. Please try again later.
                        </Alert>
                    )}

                    {/* Recommendations Content */}
                    {!isLoading && !error && hasBooks && recommendations.map((category, idx) => (
                        <div key={idx} className="mb-12 animate-fade-in" style={{ animationDelay: `${idx * 150}ms` }}>
                            {/* Category Title */}
                            <div className="flex items-center gap-3 mb-6 pl-2">
                                <h2 className="text-2xl font-bold text-primary-light drop-shadow-sm">
                                    {category.category_title}
                                </h2>
                                <Chip
                                    label={category.type}
                                    size="small"
                                    sx={{
                                        backgroundColor: 'rgba(255,255,255,0.5)',
                                        backdropFilter: 'blur(4px)',
                                        fontWeight: 'bold',
                                        color: 'primary.dark'
                                    }}
                                />
                            </div>

                            {/* Grid System */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {category.items.map((book, bIdx) => (
                                    <RecommendedBookCard
                                        key={bIdx}
                                        book={book}
                                        onClick={() => handleBookClick(book)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- Dialog: Add to Shelf --- */}
                <Dialog
                    open={addDialogOpen}
                    onClose={handleCloseDialog}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        style: { borderRadius: 24, padding: 12 }
                    }}
                >
                    <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem', pb: 1 }}>
                        Add to Shelf
                    </DialogTitle>
                    <DialogContent>
                        {selectedBook && (
                            <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    {selectedBook.title}
                                </Typography>
                                <Typography variant="body2" color="primary.light">
                                    by {selectedBook.author}
                                </Typography>
                            </Box>
                        )}

                        {addError && <Alert severity="error" sx={{ mb: 2 }}>{addError}</Alert>}
                        {addSuccess && <Alert severity="success" sx={{ mb: 2 }}>{addSuccess}</Alert>}

                        <FormControl fullWidth sx={{ mt: 1 }}>
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
                    <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                        <Button onClick={handleCloseDialog} color="inherit" disabled={isAdding} sx={{ borderRadius: 2, px: 3 }}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleAddToShelf}
                            disabled={!selectedShelfId || isAdding || !!addSuccess}
                            sx={{ borderRadius: 2, px: 4, py: 1, fontWeight: 'bold' }}
                        >
                            {isAdding ? 'Adding...' : 'Add to Shelf'}
                        </Button>
                    </DialogActions>
                </Dialog>

            </PageLayout>
        </ThemeProvider>
    );
}