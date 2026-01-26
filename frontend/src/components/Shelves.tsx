import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../api/axios';

// MUI imports
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import CssBaseline from '@mui/material/CssBaseline';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ThemeProvider } from '@mui/material/styles';
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
import mainTheme from '../themes/mainTheme';
import { PageLayout } from './layouts/PageLayout';
import type { ShelfData, ShelfBook } from '../types/book';
import BookDetailsDialog from './BookDetailsDialog';

/**
 * BookItem Component
 * * Displays a single book card with Glassmorphism effects and Tailwind styling.
 * * @param book - The book data object to display
 * @param onClick - Handler for clicking the card (opens details)
 * @param onRemove - Handler for the delete button click
 */
const BookItem = ({ book, onClick, onRemove }: { book: ShelfBook, onClick: () => void, onRemove: (e: React.MouseEvent) => void }) => (
    <div
        onClick={onClick}
        className={`
            group relative flex flex-col justify-between h-full min-h-85 cursor-pointer
            bg-white/70 backdrop-blur-md
            border border-white/40 rounded-3xl
            shadow-lg hover:shadow-2xl hover:shadow-primary-main/20 hover:-translate-y-2
            transition-all duration-300 ease-out overflow-hidden
        `}
    >
        {/* Decorative hover background */}
        <div className="absolute inset-0 bg-linear-to-br from-primary-light/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Cover Image Area */}
        <div className="relative w-full h-48 bg-gray-50/50 flex items-center justify-center overflow-hidden rounded-t-3xl border-b border-white/40 pt-4">
             {book.coverUrl ? (
                <img 
                    src={book.coverUrl} 
                    alt={book.title} 
                    className="h-full object-contain drop-shadow-md transform group-hover:scale-105 transition-transform duration-500" 
                />
            ) : (
                <MenuBookIcon sx={{ fontSize: 60 }} className="text-primary-dark" />
            )}
            
             {/* Delete Button (visible on hover) */}
             <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                <IconButton 
                    size="small" 
                    onClick={onRemove}
                    sx={{ bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: '#ffebee', color: '#d32f2f' } }}
                >
                    <DeleteIcon fontSize="small" />
                </IconButton>
             </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col flex-grow p-5">
            <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2 mb-1">
                {book.title}
            </h3>
             <p className="text-sm text-primary-main font-bold mb-3">
                {book.authors.join(', ')}
            </p>

            {/* Description */}
            <p className="text-xs text-gray-600 line-clamp-3 mb-4 flex-grow leading-relaxed">
                 {book.description || 'No description available.'}
            </p>

            {/* Progress Bar */}
            {book.pageCount > 0 && (
                <div className="mt-auto">
                     <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Progress</span>
                        <span className="text-xs font-bold text-primary-dark">
                            {Math.round((book.currentPage / book.pageCount) * 100)}%
                        </span>
                     </div>
                     <LinearProgress 
                        variant="determinate" 
                        value={(book.currentPage / book.pageCount) * 100} 
                        sx={{ 
                            borderRadius: 2, 
                            height: 6, 
                            bgcolor: 'rgba(0,0,0,0.05)', 
                            '& .MuiLinearProgress-bar': { bgcolor: 'primary.main', borderRadius: 2 } 
                        }} 
                     />
                </div>
            )}
        </div>
    </div>
);

/**
 * AddBookItem Component
 * * A card that acts as a button to trigger the "Add Book" modal.
 */
const AddBookItem = ({ onClick }: { onClick: () => void }) => (
    <div
        onClick={onClick}
        className={`
            group flex flex-col items-center justify-center text-center p-6 cursor-pointer h-full min-h-[340px]
            bg-white/30 backdrop-blur-sm
            border-2 border-dashed border-primary-main/40 rounded-3xl
            hover:bg-white/60 hover:border-primary-main hover:shadow-xl hover:-translate-y-1
            transition-all duration-300
        `}
    >
        <div className="mb-4 p-5 rounded-full bg-white/60 group-hover:bg-primary-main group-hover:text-white text-primary-main transition-all duration-300 shadow-sm">
            <AddIcon sx={{ fontSize: 40 }} />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Add New Book</h3>
        <p className="text-sm text-gray-600 font-medium max-w-50">
            Expand your collection with a new title
        </p>
    </div>
);

/**
 * Shelves Page Component
 * * Manages the view of a specific shelf, allowing users to add, remove, and view details of books.
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
     * Fetches the books associated with the current shelf ID.
     */
    const fetchShelfBooks = async () => {
        if (!id) return;
        try {
            const response = await axios.get(`/api/shelves/${id}/books`);
            const data = response.data;
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
     * Initial data fetch: Shelf Books and List of Authors (for the creation form).
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

    // --- Event Handlers: Navigation & Details ---

    const handleBookClick = (book: ShelfBook) => {
        setSelectedBook(book);
        setDetailsOpen(true);
    };

    const handleCloseDetails = () => {
        setDetailsOpen(false);
        setSelectedBook(null);
    };

    const handleBackToDashboard = () => {
        navigate('/dashboard');
    };

    // --- Modal Handlers ---

    const handleOpenModal = () => {
        setOpenModal(true);
        setTabValue(0);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setCreateError('');
        setSelectedExistingBook(null);
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        setCreateError('');
    };

    // --- Search Existing Book Logic ---

    /**
     * Searches for books in the global library database.
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
     * Adds an existing book (selected from search) to the current shelf.
     * Handles ID, GoogleBookID, or ISBN linking.
     */
    const handleAddExistingBook = async () => {
        if (!selectedExistingBook || !id) return;
        setIsCreating(true);
        try {
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
                return { ...prevData };
            });
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
     * Handles the creation of a completely new book.
     * 1. Checks if the author is new (string) or existing (object).
     * 2. Creates the author if necessary.
     * 3. Creates the book record.
     * 4. Adds the newly created book to the current shelf.
     */
    const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsCreating(true);
        setCreateError('');

        const formData = new FormData(event.currentTarget);
        let authorIdToUse = '';

        try {
            // Determine if we need to create a new author first
            if (typeof authorInput === 'string') {
                const nameParts = authorInput.trim().split(' ');
                const firstName = nameParts[0] || 'Unknown';
                const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Author';
                const newAuthorPayload = { firstName, lastName };
                const authorRes = await axios.post('/api/authors', newAuthorPayload);
                authorIdToUse = authorRes.data.id;
            } else if (authorInput && 'id' in authorInput) {
                authorIdToUse = authorInput.id;
            } else {
                throw new Error("Please select or enter an author.");
            }

            // Sanitize ISBN
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

            // Create the book
            const bookResponse = await axios.post('/api/books', bookPayload);
            const createdBook = bookResponse.data;

            // Link to Shelf
            if (id) {
                await axios.post(`/api/shelves/${id}/books`, { bookId: createdBook.id });
            }

            // Update local state to reflect the new book immediately
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

    const handleRemoveClick = (event: React.MouseEvent, book: ShelfBook) => {
        event.stopPropagation();
        setBookToDelete(book);
        setDeleteConfirmOpen(true);
    };

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
            handleCancelDelete();
        } catch (err: any) {
            console.error("Failed to remove book:", err);
            alert(`Failed to remove book: ${err.response?.data || err.message}`);
            setIsDeleting(false);
        }
    };

    const handleCancelDelete = () => {
        setDeleteConfirmOpen(false);
        setBookToDelete(null);
        setIsDeleting(false);
    };

    return (
        <ThemeProvider theme={mainTheme}>
            <CssBaseline enableColorScheme />
            
            {/* Zastosowanie PageLayout dla spójnego wyglądu */}
            <PageLayout>
                
                {/* --- Header Section --- */}
                <div className="w-full max-w-7xl mx-auto mb-8 pl-2">
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={handleBackToDashboard}
                        sx={{ 
                            mb: 3, 
                            color: 'primary.light', // Tutaj zmieniasz kolor (np. 'text.primary', 'black', '#432816')
                            '&:hover': { 
                                color: 'white', // Kolor po najechaniu myszką
                                backgroundColor: 'transparent' // Opcjonalnie usuwa tło przy hover
                            } 
                        }}
                    >
                        Back to Dashboard
                    </Button>
                    
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-sm">
                            <MenuBookIcon sx={{ fontSize: 36 }} className="text-primary-light" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-primary-light tracking-tight drop-shadow-sm">
                                {shelfData?.name || 'Shelf Loading...'}
                            </h1>
                            {shelfData?.description && (
                                <p className="text-gray-700 font-medium text-sm sm:text-base mt-1">
                                    {shelfData.description}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- Grid Section --- */}
                <div className="w-full max-w-7xl mx-auto pb-10">
                    {isLoading && (
                        <div className="flex flex-col justify-center items-center mt-20 gap-4">
                            <CircularProgress size={60} thickness={4} sx={{ color: 'white' }} />
                        </div>
                    )}

                    {error && (
                         <Alert severity="error" className="mb-8 shadow-md rounded-xl backdrop-blur-md bg-red-100/90">
                            {error}
                        </Alert>
                    )}

                    {!isLoading && !error && shelfData && (
                        /* CSS Grid layout zamiast MUI Grid */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                            
                            {/* Add New Book Card */}
                            <AddBookItem onClick={handleOpenModal} />

                            {/* Books List */}
                            {shelfData.books.map((book) => (
                                <BookItem 
                                    key={book.id} 
                                    book={book} 
                                    onClick={() => handleBookClick(book)} 
                                    onRemove={(e) => handleRemoveClick(e, book)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* --- Dialog: Add a book --- */}
                <Dialog 
                    open={openModal} 
                    onClose={handleCloseModal} 
                    maxWidth="sm" 
                    fullWidth
                    PaperProps={{
                        style: { borderRadius: 24, padding: 12 }
                    }}
                >
                    <Box>
                        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem', pb: 1 }}>
                            Add Book to Shelf
                        </DialogTitle>
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
                                            filterOptions={(x) => x} 
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
                                    <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                                        <Button onClick={handleCloseModal} color="inherit" sx={{ borderRadius: 2 }}>Cancel</Button>
                                        <Button
                                            variant="contained"
                                            onClick={handleAddExistingBook}
                                            disabled={!selectedExistingBook || isCreating}
                                            sx={{ borderRadius: 2, px: 3 }}
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
                                            <Autocomplete
                                                freeSolo
                                                id="author-autocomplete"
                                                options={authors}
                                                getOptionLabel={(option) => {
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
                                                        required={!authorInput}
                                                    />
                                                )}
                                            />
                                        </FormControl>

                                        <div className="grid grid-cols-2 gap-4">
                                            <TextField
                                                margin="dense"
                                                id="pageCount"
                                                name="pageCount"
                                                label="Pages"
                                                type="number"
                                                fullWidth
                                                variant="outlined"
                                            />
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
                                        </div>

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
                                    <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                                        <Button onClick={handleCloseModal} color="inherit" sx={{ borderRadius: 2 }}>
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            disabled={isCreating}
                                            sx={{ borderRadius: 2, px: 3 }}
                                        >
                                            {isCreating ? 'Creating...' : 'Create Book'}
                                        </Button>
                                    </DialogActions>
                                </Box>
                            )}
                        </div>
                    </Box>
                </Dialog>

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
                    PaperProps={{
                        style: { borderRadius: 24, padding: 12 }
                    }}
                >
                    <DialogTitle sx={{ fontWeight: 'bold' }}>Remove Book?</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to remove "{bookToDelete?.title}" from this shelf? This action cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={handleCancelDelete} color="inherit" disabled={isDeleting} sx={{ borderRadius: 2 }}>Cancel</Button>
                        <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus disabled={isDeleting} sx={{ borderRadius: 2 }}>
                            {isDeleting ? 'Removing...' : 'Remove'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </PageLayout>
        </ThemeProvider>
    );
}