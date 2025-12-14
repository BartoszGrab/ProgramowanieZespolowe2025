import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import CssBaseline from '@mui/material/CssBaseline';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { styled, ThemeProvider } from '@mui/material/styles';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import FormControl from '@mui/material/FormControl';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

// Custom imports
import ColorModeSelect from '../customs/ColorModeSelect';
import mainTheme from '../themes/mainTheme';
import type { ShelfData, ShelfBook } from '../types/book';
import BookDetailsDialog from './BookDetailsDialog';


/**
 * Styled container for the shelves page layout.
 * Includes responsive padding and a radial gradient background.
 */
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

/**
 * Styled card component for displaying books.
 * Adds hover effects (lift and shadow) for better interactivity.
 */
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

/**
 * Styled card component for the "Add New Book" action.
 * Uses dashed borders and transparency to distinguish it from content cards.
 */
const AddBookCard = styled(BookCard)(({ theme }) => ({
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
    borderWidth: '2px',
    borderColor: theme.palette.primary.dark,
    color: theme.palette.primary.main,
    '&:hover': {
        transform: 'translateY(-5px)',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderColor: theme.palette.primary.main,
    },
}));

/**
 * The Shelves page component.
 * Displays books in a specific shelf, allows adding new books or searching existing ones,
 * and provides functionality to remove books or view details.
 */
export default function Shelves() {
    const { id } = useParams<{ id: string }>();
    const [shelfData, setShelfData] = useState<ShelfData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [authors, setAuthors] = useState<{ id: string; firstName: string; lastName: string }[]>([]);
    const navigate = useNavigate();

    // --- State: Add Book Modal ---
    const [openModal, setOpenModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState<string>('');
    // State for Autocomplete: can be an Author object or a string (if typing new)
    const [authorInput, setAuthorInput] = useState<string | { id: string; firstName: string; lastName: string } | null>(null);

    // --- State: Add Book Modal Tabs ---
    const [tabValue, setTabValue] = useState(0);
    const [searchBookOptions, setSearchBookOptions] = useState<any[]>([]);
    const [selectedExistingBook, setSelectedExistingBook] = useState<any | null>(null);

    // --- State: Book Details Modal ---
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState<ShelfBook | null>(null);

    // --- State: Delete Confirmation Modal ---
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [bookToDelete, setBookToDelete] = useState<ShelfBook | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    /**
     * Fetches the books for the current shelf from the backend.
     */
    const fetchShelfBooks = async () => {
        if (!id) return;
        try {
            // Api Call
            const response = await axios.get(`/api/shelves/${id}/books`);
            const data = response.data;
            // Response handling
            if (data && data.books) {
                setShelfData(data);
            } else {
                setShelfData({ id: id, name: 'Unknown Shelf', bookCount: 0, description: '', books: [] });
            }
        } catch (err: any) {
            console.error('Error fetching shelf books:', err);
            setError('Could not load books for this shelf.');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Initial data fetch on component mount.
     */
    useEffect(() => {
        const fetchAuthors = async () => {
            try {
                const response = await axios.get('/api/authors');
                setAuthors(response.data);
            } catch (err) {
                console.error('Failed to fetch authors', err);
            }
        };

        fetchShelfBooks();
        fetchAuthors();
    }, [id]);

    /**
     * Opens the book details modal for the selected book.
     * @param book - The book to display details for
     */
    const handleBookClick = (book: ShelfBook) => {
        setSelectedBook(book);
        setDetailsOpen(true);
    };

    /**
     * Closes the book details modal.
     */
    const handleCloseDetails = () => {
        setDetailsOpen(false);
        setSelectedBook(null);
    };

    /**
     * Navigates back to the dashboard.
     */
    const handleBackToDashboard = () => {
        navigate('/dashboard');
    };

    // --- Modal Handlers ---

    
    /**
     * Opens the add book modal.
     */
    const handleOpenModal = () => {
        setOpenModal(true);
        setTabValue(0); // Reset to first tab
    };

    /**
     * Closes the add book modal and resets state.
     */
    const handleCloseModal = () => {
        setOpenModal(false);
        setCreateError(''); // Czyścimy błędy przy zamknięciu
        setSelectedExistingBook(null); // Reset selection
    };

    /**
     * Handles tab changes in the add book modal.
     * @param _event - The event (unused)
     * @param newValue - The new tab index
     */
    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        setCreateError('');
    };

    // --- Search Existing Book Logic ---

    /**
     * Searches for books in the library based on user input.
     * @param query - The search query string
     */
    const handleSearchBooks = async (query: string) => {
        if (!query) {
            setSearchBookOptions([]);
            return;
        }
        try {
            const res = await axios.get(`/api/books?search=${query}`);
            setSearchBookOptions(res.data);
        } catch (err) {
            console.error("Failed to search books", err);
        }
    };

    /**
     * Adds an existing book to the shelf.
     * Handles different ID types (local UUID, Google Book ID, ISBN).
     */
    const handleAddExistingBook = async () => {
        if (!selectedExistingBook || !id) return;
        setIsCreating(true);
        try {
            // Check if it's a "local" book (has a real UUID) or a "Google" book (empty/null ID)
            const hasValidId = selectedExistingBook.id && selectedExistingBook.id !== '00000000-0000-0000-0000-000000000000';
            const gId = selectedExistingBook.googleBookId || selectedExistingBook.GoogleBookId;

            let payload: any = {};
            if (hasValidId) {
                payload = { bookId: selectedExistingBook.id };
            } else if (gId) {
                payload = { googleBookId: gId };
            } else if (selectedExistingBook.isbn) {
                payload = { isbn: selectedExistingBook.isbn };
            } else {
                throw new Error("Selected book has no ID, Google ID, or ISBN. Cannot add.");
            }

            await axios.post(`/api/shelves/${id}/books`, payload);

            setShelfData((prevData) => {
                if (!prevData) return null;
                // Add the selected book to the list (mapping to ShelfBook format roughly)
                return { ...prevData };
            });
            // Re-fetch to get the full book details (including new ID if created)
            fetchShelfBooks();
            handleCloseModal();
        } catch (err: any) {
            console.error('Failed to add existing book:', err);
            const msg = err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response?.data : err.message || 'Failed to add book.');
            setCreateError(msg);
        } finally {
            setIsCreating(false);
        }
    };

    // --- Create New Book Logic ---

    /**
     * Handles the submission of the create new book form.
     * Resolves author (create if new), creates book, adds to shelf.
     * @param event - The form event
     */
    const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Zapobiega przeładowaniu strony
        setIsCreating(true);
        setCreateError('');

        const formData = new FormData(event.currentTarget);
        let authorIdToUse = '';

        try {
            // 0. Resolve Author
            if (typeof authorInput === 'string') {
                // User typed a new name -> Create Author
                const nameParts = authorInput.trim().split(' ');
                const firstName = nameParts[0] || 'Unknown';
                const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Author';

                const newAuthorPayload = { firstName, lastName };
                const authorRes = await axios.post('/api/authors', newAuthorPayload);
                authorIdToUse = authorRes.data.id;
            } else if (authorInput && 'id' in authorInput) {
                // User selected existing author
                authorIdToUse = authorInput.id;
            } else {
                throw new Error("Please select or enter an author.");
            }

            // Clean ISBN - remove hyphens
            const rawIsbn = formData.get('isbn') as string;
            const cleanIsbn = rawIsbn.replace(/-/g, '');

            const bookPayload = {
                title: formData.get('title') as string,
                isbn: cleanIsbn,
                pageCount: Number(formData.get('pageCount')),
                publishedDate: formData.get('publishedDate') ? new Date(formData.get('publishedDate') as string).toISOString() : null,
                coverUrl: formData.get('coverUrl') as string,
                description: formData.get('description') as string,
                authorIds: [authorIdToUse],
                genreIds: []
            };

            // 1. Create Book
            const bookResponse = await axios.post('/api/books', bookPayload);
            const createdBook = bookResponse.data;

            // 2. Add to Shelf
            if (id) {
                await axios.post(`/api/shelves/${id}/books`, { bookId: createdBook.id });
            }

            setShelfData((prevData) => {
                if (!prevData) return null;
                return {
                    ...prevData,
                    books: [...prevData.books, createdBook]
                };
            });

            handleCloseModal();
        } catch (err: any) {
            console.error('Failed to create book/author:', err);
            setCreateError(err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response?.data : err.message || 'Failed to create book. Try again.'));
        } finally {
            setIsCreating(false);
        }
    };

    // --- Delete Book Logic ---

    /**
     * Initiates the delete confirmation for a book.
     * @param event - The click event (to prevent opening details)
     * @param book - The book to delete
     */
    const handleRemoveClick = (event: React.MouseEvent, book: ShelfBook) => {
        event.stopPropagation(); // Prevent opening details
        setBookToDelete(book);
        setDeleteConfirmOpen(true);
    };

    /**
     * Confirms and performs the book removal from the shelf.
     */
    const handleConfirmDelete = async () => {
        if (!bookToDelete || !id) return;
        setIsDeleting(true);

        try {
            await axios.delete(`/api/shelves/${id}/books/${bookToDelete.id}`);

            setShelfData((prevData) => {
                if (!prevData) return null;
                return {
                    ...prevData,
                    books: prevData.books.filter(b => b.id !== bookToDelete.id)
                };
            });
            handleCancelDelete(); // Close only on success
        } catch (err: any) {
            console.error("Failed to remove book:", err);
            alert(`Failed to remove book: ${err.response?.data || err.message}`);
            setIsDeleting(false); // Re-enable button
        }
    };

    /**
     * Cancels the delete confirmation.
     */
    const handleCancelDelete = () => {
        setDeleteConfirmOpen(false);
        setBookToDelete(null);
        setIsDeleting(false);
    };

    return (
        <ThemeProvider theme={mainTheme}>
            <CssBaseline enableColorScheme />
            <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 10 }} />

            <ShelvesContainer>
                {/* --- Section: Header --- */}
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

                {/* --- Section: Grid --- */}
                <Box sx={{ width: '100%', maxWidth: '1200px', mx: 'auto' }}>
                    {isLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                            <CircularProgress />
                        </Box>
                    )}
                    {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

                    {!isLoading && !error && shelfData && (
                        <Grid container spacing={3}>

                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                <AddBookCard onClick={handleOpenModal}>
                                    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                        <AddIcon sx={{ fontSize: 60, opacity: 0.7 }} />
                                        <Typography variant="h6" color="textPrimary" sx={{ opacity: 0.6 }} fontWeight="bold">Create New Book</Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.9 }}>Add your new favourite</Typography>
                                    </CardContent>
                                </AddBookCard>
                            </Grid>

                            {shelfData.books.map((book) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={book.id}>
                                    <BookCard onClick={() => handleBookClick(book)} sx={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image={book.coverUrl || 'https://via.placeholder.com/150'}
                                            alt={book.title}
                                            sx={{ objectFit: 'contain', backgroundColor: '#f5f5f5', pt: 2 }}
                                        />
                                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                            <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold', fontSize: '1rem', lineHeight: 1.2, mb: 1 }}>
                                                {book.title}
                                            </Typography>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                    {book.authors.join(', ')}
                                                </Typography>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={(e: React.MouseEvent) => handleRemoveClick(e, book)}
                                                    sx={{
                                                        mt: -0.5,
                                                        mr: -0.5,
                                                        opacity: 0.6,
                                                        '&:hover': { opacity: 1, backgroundColor: 'rgba(211, 47, 47, 0.1)' }
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>

                                            {/* Progress Bar */}
                                            {book.pageCount > 0 && (
                                                <Box sx={{ width: '100%', mr: 1, mb: 1 }}>
                                                    <LinearProgress variant="determinate" value={(book.currentPage / book.pageCount) * 100} />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {Math.round((book.currentPage / book.pageCount) * 100)}% read
                                                    </Typography>
                                                </Box>
                                            )}

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    display: '-webkit-box',
                                                    overflow: 'hidden',
                                                    WebkitBoxOrient: 'vertical',
                                                    WebkitLineClamp: 3, // Limit to 3 lines
                                                    textOverflow: 'ellipsis'
                                                }}
                                            >
                                                {book.description || 'No description available.'}
                                            </Typography>
                                        </CardContent>
                                    </BookCard>
                                </Grid>
                            ))}
                        </Grid>
                    )
                    }
                </Box>

                {/* --- Dialog: Add a book --- */}
                <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                    <Box>
                        <DialogTitle>Add Book to Shelf</DialogTitle>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
                            <Tabs value={tabValue} onChange={handleTabChange}>
                                <Tab label="Search Library" />
                                <Tab label="Create New" />
                            </Tabs>
                        </Box>

                        {/* TAB 0: SEARCH EXISTING */}
                        <div role="tabpanel" hidden={tabValue !== 0}>
                            {tabValue === 0 && (
                                <>
                                    <DialogContent>
                                        <DialogContentText sx={{ mb: 2 }}>
                                            Search for an existing book in the library and add it to your shelf.
                                        </DialogContentText>
                                        {createError && <Alert severity="error" sx={{ mb: 2 }}>{createError}</Alert>}

                                        <Autocomplete
                                            id="search-books"
                                            options={searchBookOptions}
                                            getOptionLabel={(option) => `${option.title} (${option.isbn})`}
                                            filterOptions={(x) => x} // Disable built-in filtering, rely on server
                                            onInputChange={(_e, newUrl) => handleSearchBooks(newUrl)}
                                            onChange={(_e, newValue) => setSelectedExistingBook(newValue)}
                                            renderOption={(props, option) => {
                                            const { key, ...rest } = props; 
                                            
                                            return (
                                                <li key={key} {...rest}>
                                                    <Box>
                                                        <Typography variant="body1" fontWeight="bold">{option.title}</Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            ISBN: {option.isbn} | By {option.authors.join(', ')}
                                                        </Typography>
                                                    </Box>
                                                </li>
                                            );
                                        }}
                                            renderInput={(params) => (
                                                <TextField {...params} label="Search by Title or ISBN" fullWidth />
                                            )}
                                        />
                                    </DialogContent>
                                    <DialogActions sx={{ px: 3, pb: 3 }}>
                                        <Button onClick={handleCloseModal} color="inherit">Cancel</Button>
                                        <Button
                                            variant="contained"
                                            onClick={handleAddExistingBook}
                                            disabled={!selectedExistingBook || isCreating}
                                        >
                                            {isCreating ? 'Adding...' : 'Add to Shelf'}
                                        </Button>
                                    </DialogActions>
                                </>
                            )}
                        </div>

                        {/* TAB 1: CREATE NEW */}
                        <div role="tabpanel" hidden={tabValue !== 1}>
                            {tabValue === 1 && (
                                <Box component="form" onSubmit={handleCreateSubmit}>
                                    <DialogContent>
                                        <DialogContentText sx={{ mb: 2 }}>
                                            Can't find it? Create a new book entry.
                                        </DialogContentText>

                                        {createError && (
                                            <Alert severity="error" sx={{ mb: 2 }}>
                                                {createError}
                                            </Alert>
                                        )}

                                        <TextField
                                            autoFocus
                                            required
                                            margin="dense"
                                            id="title"
                                            name="title"
                                            label="Book Title"
                                            type="text"
                                            fullWidth
                                            variant="outlined"
                                            placeholder="Harry Potter..."
                                        />

                                        <TextField
                                            required
                                            margin="dense"
                                            id="isbn"
                                            name="isbn"
                                            label="ISBN"
                                            type="text"
                                            fullWidth
                                            variant="outlined"
                                            placeholder="978-3-16-148410-0"
                                        />

                                        <FormControl fullWidth margin="dense">
                                            {/* <InputLabel id="author-select-label">Author</InputLabel> */}
                                            <Autocomplete
                                                freeSolo
                                                id="author-autocomplete"
                                                options={authors}
                                                getOptionLabel={(option) => {
                                                    // option can be string (user typed) or object (selected)
                                                    if (typeof option === 'string') return option;
                                                    return `${option.firstName} ${option.lastName}`;
                                                }}
                                                value={authorInput}
                                                onChange={(_event: any, newValue: string | { id: string; firstName: string; lastName: string } | null) => {
                                                    setAuthorInput(newValue);
                                                }}
                                                onInputChange={(event: any, newInputValue: string) => {
                                                    if (event?.type === 'change') {
                                                        setAuthorInput(newInputValue);
                                                    }
                                                }}
                                                renderInput={(params: any) => (
                                                    <TextField
                                                        {...params}
                                                        label="Author (Select or Type New)"
                                                        placeholder="J.K. Rowling"
                                                        required={!authorInput} // simplistic validation
                                                    />
                                                )}
                                            />
                                        </FormControl>

                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 6 }}>
                                                <TextField
                                                    margin="dense"
                                                    id="pageCount"
                                                    name="pageCount"
                                                    label="Pages"
                                                    type="number"
                                                    fullWidth
                                                    variant="outlined"
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 6 }}>
                                                <TextField
                                                    margin="dense"
                                                    id="publishedDate"
                                                    name="publishedDate"
                                                    label="Published Date"
                                                    type="date"
                                                    fullWidth
                                                    variant="outlined"
                                                    InputLabelProps={{ shrink: true }}
                                                />
                                            </Grid>
                                        </Grid>

                                        <TextField
                                            margin="dense"
                                            id="coverUrl"
                                            name="coverUrl"
                                            label="Cover URL"
                                            type="url"
                                            fullWidth
                                            variant="outlined"
                                            placeholder="https://..."
                                        />
                                        <TextField
                                            margin="dense"
                                            id="description"
                                            name="description"
                                            label="Description"
                                            type="text"
                                            fullWidth
                                            multiline
                                            rows={3}
                                            variant="outlined"
                                            placeholder="A young wizard's journey begins..."
                                        />
                                    </DialogContent>
                                    <DialogActions sx={{ px: 3, pb: 3 }}>
                                        <Button onClick={handleCloseModal} color="inherit">
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            disabled={isCreating}
                                        >
                                            {isCreating ? 'Creating...' : 'Create Book'}
                                        </Button>
                                    </DialogActions>
                                </Box>
                            )}
                        </div>
                    </Box>
                </Dialog>



            </ShelvesContainer>

            {/* --- Dialog: Details --- */}
            {id && (
                <BookDetailsDialog
                    open={detailsOpen}
                    onClose={handleCloseDetails}
                    book={selectedBook}
                    shelfId={id}
                    onUpdate={fetchShelfBooks}
                />
            )}

            {/* --- Dialog: Delete Confirmation --- */}
            <Dialog
                open={deleteConfirmOpen}
                onClose={handleCancelDelete}
            >
                <DialogTitle>Remove Book?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to remove "{bookToDelete?.title}" from this shelf? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete} color="inherit" disabled={isDeleting}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error" autoFocus disabled={isDeleting}>
                        {isDeleting ? 'Removing...' : 'Remove'}
                    </Button>
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    );
}