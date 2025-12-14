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
import { styled, ThemeProvider } from '@mui/material/styles';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

// Custom imports
import ColorModeSelect from '../customs/ColorModeSelect'; // possible TODO: color mode switch implementation
import mainTheme from '../themes/mainTheme';

/**
 * Data Transfer Object representing a book shelf.
 */
interface Shelf {
    /** Unique identifier for the shelf */
    id: string | number;
    /** Display name of the shelf */
    name: string;
    /** Optional description of the shelf's contents */
    description?: string;
    /** Number of books contained in this shelf */
    bookCount?: number;
}

/**
 * Styled container for the dashboard layout.
 * Includes responsive padding and a radial gradient background.
 */
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
        backgroundAttachment: 'fixed',
    },
}));

/**
 * Styled card component for displaying shelf summaries.
 * Adds hover effects (lift and shadow) for better interactivity.
 */
const ShelfCard = styled(MuiCard)(({ theme }) => ({
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

/**
 * Specialized card component for the "Add New Shelf" action.
 * Uses dashed borders and transparency to distinguish it from content cards.
 */
const AddShelfCard = styled(ShelfCard)(({ theme }) => ({
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
 * The Dashboard page component.
 * Displays the user's library shelves and provides functionality to create new ones.
 */
export default function Dashboard() {
    // --- State: Data Fetching ---
    const [shelves, setShelves] = useState<Shelf[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // --- State: Create Shelf Modal ---
    const [openModal, setOpenModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState<string>('');
    
    const navigate = useNavigate();
    
    /**
     * Fetches the list of shelves from the backend on component mount.
     */
    useEffect(() => {
        const fetchShelves = async () => {
            try {
                const response = await axios.get('/api/shelves');
                setShelves(response.data);
            } catch (err: any) {
                console.error('Error fetching shelves:', err);
                setError('Could not load your library shelves.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchShelves();
    }, []);

    /**
     * Navigates to the detailed view of a specific shelf.
     * @param shelfId - The ID of the shelf to view
     */
    const handleShelfClick = (shelfId: string | number) => {
        navigate(`/shelves/${shelfId}`);
    };

    // --- Modal Handlers ---
    const handleOpenModal = () => setOpenModal(true);

    const handleCloseModal = () => {
        setOpenModal(false);
        setCreateError(''); // Clear errors when closing
    };

    /**
     * Handles the submission of the "Create Shelf" form.
     * Sends data to the API and updates local state upon success.
     */
    const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Prevent page reload
        setIsCreating(true);
        setCreateError('');

        const formData = new FormData(event.currentTarget);
        const newShelfData = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
        };

        try {
            // Api call to create the new shelf
            const response = await axios.post('/api/shelves', newShelfData);

            // Update local state with the newly created shelf
            const createdShelf = response.data;

            setShelves((prevShelves) => [...prevShelves, createdShelf]);

            // Close the modal
            handleCloseModal();
        } catch (err: any) {
            console.error('Failed to create shelf:', err);
            setCreateError(err.response?.data?.message || 'Failed to create shelf. Try again.');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <ThemeProvider theme={mainTheme}>
            <CssBaseline enableColorScheme />
            <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 10 }} />

            <DashboardContainer>
                {/* --- Section: Header --- */}
                <Box sx={{ mb: 4, width: '100%', maxWidth: '1200px', mx: 'auto' }}>
                    <Typography
                        component="h1"
                        variant="h4"
                        sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2 }}
                    >
                        <AutoStoriesIcon fontSize="large" color="primary" />
                        My Library
                    </Typography>
                </Box>

                {/* --- Section: Shelves Grid --- */}
                <Box sx={{ width: '100%', maxWidth: '1200px', mx: 'auto' }}>
                    {isLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                            <CircularProgress />
                        </Box>
                    )}
                    {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

                    {!isLoading && !error && (
                        <Grid container spacing={3}>
                            
                            {/* Add New Shelf Card */}
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                <AddShelfCard onClick={handleOpenModal}>
                                    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                        <AddIcon sx={{ fontSize: 60, opacity: 0.7 }} />
                                        <Typography variant="h6" color="textPrimary" sx={{ opacity: 0.6 }} fontWeight="bold">Create New Shelf</Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.9 }}>Add a collection</Typography>
                                    </CardContent>
                                </AddShelfCard>
                            </Grid>

                            {/* Existing Shelves List */}
                            {Array.isArray(shelves) && shelves.map((shelf) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={shelf.id}>
                                    <ShelfCard onClick={() => handleShelfClick(shelf.id)}>
                                        <CardContent>
                                            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                {shelf.name}
                                            </Typography>
                                            {shelf.description && (
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                    {shelf.description}
                                                </Typography>
                                            )}
                                            <Box sx={{ mt: 2, py: 0.5, px: 1.5, bgcolor: 'action.hover', borderRadius: 1, display: 'inline-block' }}>
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

                {/* --- Dialog: Create Shelf --- */}
                <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                    <Box component="form" onSubmit={handleCreateSubmit}>
                        <DialogTitle>Create New Shelf</DialogTitle>
                        <DialogContent>
                            <DialogContentText sx={{ mb: 2 }}>
                                Organize your books by creating a new shelf. Give it a catchy name!
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
                                label="Shelf Name"
                                type="text"
                                fullWidth
                                variant="outlined"
                                placeholder="e.g., Fantasy Favorites"
                            />
                            <TextField
                                margin="dense"
                                id="description"
                                name="description"
                                label="Description (Optional)"
                                type="text"
                                fullWidth
                                multiline
                                rows={3}
                                variant="outlined"
                                placeholder="What kind of books will be here?"
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
                                {isCreating ? 'Creating...' : 'Create Shelf'}
                            </Button>
                        </DialogActions>
                    </Box>
                </Dialog>

            </DashboardContainer>
        </ThemeProvider>
    );
}