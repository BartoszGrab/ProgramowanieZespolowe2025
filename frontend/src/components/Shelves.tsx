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
import AddIcon from '@mui/icons-material/Add';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';

// Custom imports
import ColorModeSelect from '../customs/ColorModeSelect';
import mainTheme from '../themes/mainTheme';
import { Book } from '@mui/icons-material';

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

export default function Shelves() {
    const { id } = useParams<{ id: string }>(); // Pobierz ID półki z URL
    const [shelfData, setShelfData] = useState<ShelfData | null>(null);
    const [books, setBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // -- STANY DO MODALA --
    const [openModal, setOpenModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState<string>('');

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

    // Otwieranie/zamykanie modala
    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => {
        setOpenModal(false);
        setCreateError(''); // Czyścimy błędy przy zamknięciu
    };

    // -- LOGIKA TWORZENIA Ksiazki --
        const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault(); // Zapobiega przeładowaniu strony
            setIsCreating(true);
            setCreateError('');
    
            const formData = new FormData(event.currentTarget);
            const newBookData = {
                title: formData.get('name') as string,
                author: formData.get('author') as string,
                description: formData.get('description') as string,
            };
    
            try {
                const response = await axios.post('/api/shelves/books', newBookData); // TO DO!!! ENDPOINT
                
                const createdBook = response.data; 
                
                setBooks((prevBooks) => [...prevBooks, createdBook]);
    
                handleCloseModal();
            } catch (err: any) {
                console.error('Failed to create book:', err);
                setCreateError(err.response?.data?.message || 'Failed to create book. Try again.');
            } finally {
                setIsCreating(false);
            }
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
                            <Grid container spacing={3}>
                                
                                <Grid size={{xs: 12, sm: 6, md: 4, lg: 3 }}>
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
                        ) 
                    }
                </Box>

                {/* --- MODAL (DIALOG) TWORZENIA Ksiazki --- */}
                <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                    <Box component="form" onSubmit={handleCreateSubmit}>
                        <DialogTitle>Create New Book</DialogTitle>
                        <DialogContent>
                            <DialogContentText sx={{ mb: 2 }}>
                                Fill in the details below to create a new book in this shelf.
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
                                id="name"
                                name="name"
                                label="Book Name"
                                type="text"
                                fullWidth
                                variant="outlined"
                                placeholder="Hary Pota i twoj stary"
                            />
                             <TextField
                                margin="dense"
                                id="author"
                                name="author"
                                label="Author"
                                type="text"
                                fullWidth
                                multiline
                                variant="outlined"
                                placeholder="J.K. Rowling"
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
                </Dialog>



            </ShelvesContainer>
        </ThemeProvider>
    );
}