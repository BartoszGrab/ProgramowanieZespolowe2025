import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

// MUI imports
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Custom imports
import mainTheme from '../themes/mainTheme';
import { PageLayout } from './layouts/PageLayout';

/**
 * Represents a user-defined collection of books (a Shelf).
 */
interface Shelf {
    /** Unique identifier for the shelf. */
    id: string | number;
    /** The display name of the shelf. */
    name: string;
    /** Optional description or purpose of the shelf. */
    description?: string;
    /** The total number of books currently assigned to this shelf. */
    bookCount?: number;
}

/**
 * A presentational component representing a single shelf card.
 * * @remarks
 * Uses a **Glassmorphism** visual style (`backdrop-blur`, semi-transparent white backgrounds)
 * to blend seamlessly with the `PageLayout` background.
 * * @param props.shelf - The data object containing shelf details.
 * @param props.onClick - Handler triggered when the user selects the card.
 */
const ShelfItem = ({ shelf, onClick }: { shelf: Shelf; onClick: () => void }) => (
    <div
        onClick={onClick}
        className={`
            group relative flex flex-col justify-between p-6 cursor-pointer min-h-65
            bg-white/70 backdrop-blur-md
            border border-white/40 rounded-3xl
            shadow-lg hover:shadow-2xl hover:shadow-primary-main/20 hover:-translate-y-2
            transition-all duration-300 ease-out overflow-hidden
        `}
    >
        {/* Hover Effect: Decorative gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-primary-light/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Top: Icon & Name */}
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-primary-light/10 text-primary-dark group-hover:bg-primary-dark group-hover:text-white transition-colors duration-300 shadow-inner">
                    <MenuBookIcon />
                </div>
                <h3 className="text-xl font-bold text-text-primary truncate pr-2">
                    {shelf.name}
                </h3>
            </div>
            
            {shelf.description && (
                <p className="text-sm text-gray-700 font-medium line-clamp-3 leading-relaxed opacity-90 mb-4">
                    {shelf.description}
                </p>
            )}
        </div>

        {/* Bottom Section: Statistics & Action Indicator */}
        <div className="relative z-10 mt-auto pt-4 border-t border-gray-200/50 flex justify-between items-center">
            <span className="text-xs font-bold text-primary-dark bg-white/50 px-3 py-1 rounded-full shadow-sm">
                {shelf.bookCount !== undefined ? shelf.bookCount == 1 ? `${shelf.bookCount} Book` : `${shelf.bookCount} Books` : 'Empty'}
            </span>
            <span className="opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300 text-primary-dark font-bold text-xl">
                →
            </span>
        </div>
    </div>
);

/**
 * A specialized action card that triggers the "Create Shelf" modal.
 * Designed to look distinct from standard shelf items (dashed border, lighter background).
 * * @param props.onClick - Handler to open the creation dialog.
 */
const AddShelfItem = ({ onClick }: { onClick: () => void }) => (
    <div
        onClick={onClick}
        className={`
            group flex flex-col items-center justify-center text-center p-6 cursor-pointer min-h-65
            bg-white/30 backdrop-blur-sm
            border-2 border-dashed border-primary-main/40 rounded-3xl
            hover:bg-white/45 hover:border-primary-main hover:shadow-xl hover:-translate-y-1
            transition-all duration-300
        `}
    >
        <div className="mb-3 p-4 rounded-full bg-white/60 group-hover:bg-primary-dark group-hover:text-white text-primary-dark transition-all duration-300 shadow-sm">
            <AddIcon sx={{ fontSize: 32 }} />
        </div>
        <h3 className="text-lg font-bold text-primary-light mb-1">Create New Shelf</h3>
        <p className="text-sm text-primary-light font-medium">Add a collection</p>
    </div>
);

/**
 * The main Dashboard view acting as the entry point for the user's library.
 * * @remarks
 * Responsibilities:
 * 1. Fetches and displays the list of user shelves.
 * 2. Provides the UI and Logic for creating new shelves via a Modal.
 * 3. Handles navigation to specific shelf details.
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
     * Effect: Fetch Initial Data.
     * Retrieving the list of shelves from the API on component mount.
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
     * Navigates to the detailed view of a selected shelf.
     * @param shelfId - The ID of the shelf to view.
     */
    const handleShelfClick = (shelfId: string | number) => {
        navigate(`/shelves/${shelfId}`);
    };

    // --- Modal Handlers ---
    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => {
        setOpenModal(false);
        setCreateError('');
    };

    /**
     * Handles the creation of a new shelf.
     * * @remarks
     * 1. Prevents default form submission.
     * 2. Extracts data from `FormData`.
     * 3. Sends POST request to API.
     * 4. On success: Updates local state (optimistic-like addition) and closes modal.
     * 5. On failure: Sets an error message to be displayed within the modal.
     * * @param event - The form submission event.
     */
    const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsCreating(true);
        setCreateError('');

        const formData = new FormData(event.currentTarget);
        const newShelfData = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
        };

        try {
            const response = await axios.post('/api/shelves', newShelfData);
            setShelves((prevShelves) => [...prevShelves, response.data]);
            handleCloseModal();
        } catch (err: any) {
            console.error('Failed to create shelf:', err);
            setCreateError(err.response?.data?.message || 'Failed to create shelf.');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <ThemeProvider theme={mainTheme}>
            <CssBaseline enableColorScheme />
            
            {/* PageLayout handles the background layering and fixed Navbar padding */}
            <PageLayout>
                
                {/* --- Section: Header --- */}
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
                            <AutoStoriesIcon sx={{ fontSize: 36 }} className="text-primary-light" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-primary-light tracking-tight drop-shadow-sm">
                                My Library
                            </h1>
                            <p className="text-primary-light font-medium text-sm sm:text-base backdrop-blur-xs rounded-4xl">
                                Manage your collections
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- Section: Content --- */}
                <div className="w-full pb-10">
                    {isLoading && (
                        <div className="flex justify-center mt-20">
                            <CircularProgress size={60} thickness={4} sx={{ color: 'white' }} />
                        </div>
                    )}
                    
                    {error && (
                        <Alert severity="error" className="mb-8 shadow-md rounded-xl backdrop-blur-md bg-red-100/90">
                            {error}
                        </Alert>
                    )}

                    {!isLoading && !error && (
                        /* Grid System */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            
                            {/* Add New Shelf Card */}
                            <AddShelfItem onClick={handleOpenModal} />

                            {/* Existing Shelves List */}
                            {Array.isArray(shelves) && shelves.map((shelf) => (
                                <ShelfItem 
                                    key={shelf.id} 
                                    shelf={shelf} 
                                    onClick={() => handleShelfClick(shelf.id)} 
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* --- Dialog: Create Shelf --- */}
                <Dialog 
                    open={openModal} 
                    onClose={handleCloseModal} 
                    maxWidth="sm" 
                    fullWidth
                    PaperProps={{
                        style: { borderRadius: 24, padding: 12 }
                    }}
                >
                    <Box component="form" onSubmit={handleCreateSubmit}>
                        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem', pb: 1 }}>
                            Create New Shelf
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText sx={{ mb: 3 }}>
                                Give your new collection a home. What kind of books will live here?
                            </DialogContentText>

                            {createError && (
                                <Alert severity="error" sx={{ mb: 2 }}>{createError}</Alert>
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
                                placeholder="e.g., Summer Reads 2024"
                                sx={{ mb: 3 }}
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
                                placeholder="A place for mysteries and thrillers..."
                            />
                        </DialogContent>
                        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                            <Button onClick={handleCloseModal} color="inherit" sx={{ borderRadius: 2, px: 3 }}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={isCreating}
                                disableElevation
                                sx={{ borderRadius: 2, px: 4, py: 1, fontWeight: 'bold' }}
                            >
                                {isCreating ? 'Creating...' : 'Create Shelf'}
                            </Button>
                        </DialogActions>
                    </Box>
                </Dialog>

            </PageLayout>
        </ThemeProvider>
    );
}