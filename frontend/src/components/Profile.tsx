import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';

// MUI imports (Functional components kept for complex interactions like Modals/Inputs)
import {
    Typography,
    Avatar,
    TextField,
    Button,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Autocomplete,
    Box,
    CircularProgress
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import BookIcon from '@mui/icons-material/Book';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Custom imports
import mainTheme from '../themes/mainTheme';
import { PageLayout } from './layouts/PageLayout';
import { useNavigate } from 'react-router-dom';

// --- Types ---

interface BookDto {
    id: string;
    title: string;
    coverUrl?: string;
    authors: string[];
    googleBookId?: string;
}

interface UserProfile {
    id: string;
    displayName: string;
    email: string;
    profilePictureUrl?: string;
    bio?: string;
    shelvesCount: number;
    uniqueBooksCount: number;
    followersCount: number;
    followingCount: number;
    createdAt: string;
    isFollowing?: boolean;
    favoriteBook?: BookDto;
}

interface UpdateProfileDto {
    bio?: string;
    favoriteBookId?: string;
    googleBookId?: string;
}

// --- Components ---

/**
 * Reusable Stat Card Component (Tailwind + Glassmorphism)
 */
const StatItem = ({ icon: Icon, count, label, colorClass }: any) => (
    <div className={`
        flex flex-col items-center justify-center p-6 h-full
        bg-white/70 backdrop-blur-md rounded-3xl border border-white/40 shadow-lg
        hover:shadow-xl hover:-translate-y-1 transition-all duration-300
    `}>
        <div className={`p-3 rounded-full ${colorClass} bg-opacity-10 mb-2`}>
            <Icon className={colorClass} sx={{ fontSize: 32 }} />
        </div>
        <span className="text-3xl font-extrabold text-gray-800">{count}</span>
        <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">{label}</span>
    </div>
);

export default function Profile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Edit Modal State
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editBio, setEditBio] = useState('');
    const [editAvatarUrl, setEditAvatarUrl] = useState('');
    const [followingCount, setFollowingCount] = useState(0);
    const [followersCount, setFollowersCount] = useState(0);
    const [selectedBook, setSelectedBook] = useState<BookDto | null>(null);
    const [searchBooks, setSearchBooks] = useState<BookDto[]>([]);
    const [searching, setSearching] = useState(false);

    // Determine if we are viewing our own profile
    const isOwnProfile = !id;

    useEffect(() => {
        fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const endpoint = id ? `/api/users/${id}` : '/api/users/me';
            const response = await axios.get(endpoint);
            setProfile(response.data);

            // Initialize edit state
            setEditBio(response.data.bio || '');
            setEditAvatarUrl(response.data.profilePictureUrl || '');
            setSelectedBook(response.data.favoriteBook || null);
            setFollowersCount(response.data.followersCount || null);
            setFollowingCount(response.data.followingCount || null);
            
            if (followingCount) {
                setProfile(prev => prev ? ({ ...prev, followingCount }) : null);
            }

            if (followersCount) {
                setProfile(prev => prev ? ({ ...prev, followersCount }) : null);
            }

        } catch (err) {
            console.error("Failed to fetch profile", err);
            setError("Failed to load profile.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFollowToggle = async () => {
        if (!profile) return;

        try {
            if (profile.isFollowing) {
                await axios.delete(`/api/users/${profile.id}/follow`);
                setProfile(prev => prev ? ({ ...prev, isFollowing: false, followersCount: prev.followersCount - 1 }) : null);
            } else {
                await axios.post(`/api/users/${profile.id}/follow`);
                setProfile(prev => prev ? ({ ...prev, isFollowing: true, followersCount: prev.followersCount + 1 }) : null);
            }
        } catch (err) {
            console.error("Failed to toggle follow", err);
        }
    };

    const handleSearchBooks = async (query: string) => {
        if (!query) {
            setSearchBooks([]);
            return;
        }
        setSearching(true);
        try {
            const response = await axios.get(`/api/books?search=${encodeURIComponent(query)}`);
            setSearchBooks(response.data);
        } catch (err) {
            console.error("Failed to search books", err);
        } finally {
            setSearching(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            if (editAvatarUrl !== profile?.profilePictureUrl) {
                await axios.put('/api/users/me/avatar', { profilePictureUrl: editAvatarUrl });
            }

            let favBookId = selectedBook?.id;
            // Check if selected book is external (Google Book) - indicated by Empty GUID
            if (selectedBook && selectedBook.id === '00000000-0000-0000-0000-000000000000') {
                favBookId = undefined; // Do not send invalid GUID
            }

            const updateDto: UpdateProfileDto = {
                bio: editBio,
                favoriteBookId: favBookId,
                googleBookId: selectedBook?.id === '00000000-0000-0000-0000-000000000000' ? selectedBook.googleBookId : undefined
            };

            await axios.put('/api/users/me/profile', updateDto);

            setIsEditOpen(false);
            fetchProfile();
        } catch (err) {
            console.error("Failed to update profile", err);
        }
    };

    return (
        <ThemeProvider theme={mainTheme}>
            <PageLayout>
                {/* --- Top Navigation --- */}
                <div className="w-full max-w-6xl mx-auto mb-6 pl-2 animate-fade-in">
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate(-1)}
                        sx={{ mb: 2, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                    >
                        Go Back
                    </Button>
                </div>

                {/* --- Loading & Error States --- */}
                {isLoading && (
                    <div className="flex flex-col justify-center items-center mt-20 gap-4">
                        <CircularProgress size={60} thickness={4} sx={{ color: 'white' }} />
                        <p className="text-white font-medium text-lg drop-shadow-md">Loading Profile...</p>
                    </div>
                )}

                {error && !isLoading && (
                     <Alert severity="error" className="max-w-4xl mx-auto mb-8 shadow-md rounded-xl backdrop-blur-md bg-red-100/90">
                        {error}
                    </Alert>
                )}

                {/* --- Main Profile Content --- */}
                {!isLoading && profile && (
                    <div className="w-full max-w-6xl mx-auto pb-10 space-y-8 animate-fade-in">
                        
                        {/* 1. Profile Header Card */}
                        <div className="relative overflow-hidden bg-white/70 backdrop-blur-md border border-white/40 rounded-4xl shadow-xl p-8 md:p-10">
                            {/* Gradient Background Decoration */}
                            <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-r from-primary-light/30 to-secondary-light/20 z-0" />
                            
                            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10 pt-4">
                                
                                {/* Avatar with border */}
                                <div className="relative group">
                                    <div className="absolute -inset-1 bg-linear-to-br from-primary-main to-secondary-main rounded-full opacity-70 blur-xs group-hover:opacity-100 transition duration-500 ,"></div>
                                    <Avatar
                                        src={profile.profilePictureUrl}
                                        alt={profile.displayName}
                                        sx={{ 
                                            width: 140, 
                                            height: 140, 
                                            border: '4px solid white',
                                            boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
                                        }}
                                        className="relative"
                                    />
                                </div>

                                {/* User Info */}
                                <div className="flex-1 text-center md:text-left mb-2">
                                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-2">
                                        {profile.displayName}
                                    </h1>
                                    <p className="text-gray-600 font-medium text-lg max-w-2xl leading-relaxed mb-4">
                                        {profile.bio || "This user prefers to keep an air of mystery."}
                                    </p>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-500 font-medium">
                                        <span className="bg-white/50 px-3 py-1 rounded-full border border-gray-200">
                                            Joined {new Date(profile.createdAt).toLocaleDateString()}
                                        </span>
                                        <div className="flex gap-4 px-2">
                                            <span><strong className="text-gray-900">{profile.followersCount}</strong> Followers</span>
                                            <span><strong className="text-gray-900">{profile.followingCount}</strong> Following</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div className="md:self-center md:mb-15">
                                    {isOwnProfile ? (
                                        <Button
                                            variant="outlined"
                                            startIcon={<EditIcon />}
                                            onClick={() => setIsEditOpen(true)}
                                            sx={{ 
                                                color: 'text.secondary',
                                                borderRadius: 3, 
                                                borderWidth: 2,
                                                borderColor: 'text.secondary', 
                                                fontWeight: 'bold',
                                                px: 3,
                                                '&:hover': { borderWidth: 3 }
                                            }}
                                        >
                                            Edit Profile
                                        </Button>
                                    ) : (
                                        <Button
                                            variant={profile.isFollowing ? "outlined" : "contained"}
                                            color={profile.isFollowing ? "secondary" : "primary"}
                                            startIcon={profile.isFollowing ? <PersonRemoveIcon /> : <PersonAddIcon />}
                                            onClick={handleFollowToggle}
                                            sx={{ 
                                                borderRadius: 3, 
                                                fontWeight: 'bold', 
                                                px: 4, 
                                                boxShadow: profile.isFollowing ? 'none' : '0 4px 14px rgba(221, 152, 10, 0.4)' 
                                            }}
                                        >
                                            {profile.isFollowing ? "Unfollow" : "Follow"}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 2. Grid Layout for Stats & Favorite Book */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                            
                            {/* Left Column: Stats (4 columns) */}
                            <div className="md:col-span-4 flex flex-col gap-6">
                                <StatItem 
                                    icon={AutoStoriesIcon} 
                                    count={profile.shelvesCount} 
                                    label="Shelves Created" 
                                    colorClass="text-primary-main"
                                />
                                <StatItem 
                                    icon={BookIcon} 
                                    count={profile.uniqueBooksCount} 
                                    label="Books Collected" 
                                    colorClass="text-secondary-main"
                                />
                            </div>

                            {/* Right Column: Favorite Book (8 columns) */}
                            <div className="md:col-span-8">
                                <div className="h-full bg-white/70 backdrop-blur-md border border-white/40 rounded-[2rem] shadow-lg p-6 flex flex-col">
                                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200/50">
                                        <EmojiEventsIcon className="text-yellow-500" />
                                        <h2 className="text-xl font-bold text-gray-800">Top Pick</h2>
                                    </div>
                                    
                                    <div className="grow flex items-center justify-center">
                                        {profile.favoriteBook ? (
                                            <div className="flex flex-col sm:flex-row gap-6 items-center w-full p-4 hover:bg-white/40 rounded-2xl transition-colors cursor-default">
                                                {/* Cover with shadow effect */}
                                                <div className="relative shrink-0">
                                                    <div className="absolute inset-0 bg-gray-900 rounded-lg blur-md opacity-20 translate-y-2"></div>
                                                    <img 
                                                        src={profile.favoriteBook.coverUrl || '/placeholder-book.png'} 
                                                        alt={profile.favoriteBook.title}
                                                        className="relative w-32 md:w-40 h-auto rounded-lg shadow-md object-cover transform hover:scale-105 transition duration-500"
                                                    />
                                                </div>
                                                
                                                <div className="text-center sm:text-left">
                                                    <h3 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
                                                        {profile.favoriteBook.title}
                                                    </h3>
                                                    <p className="text-lg text-primary-dark font-medium mb-3">
                                                        by {profile.favoriteBook.authors.join(', ')}
                                                    </p>
                                                    <div className="inline-block bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full">
                                                        FAVORITE
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center text-gray-400 py-12">
                                                <AutoStoriesIcon sx={{ fontSize: 60, opacity: 0.3, mb: 2 }} />
                                                <p className="font-medium">No favorite book selected yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- Edit Modal (MUI Dialog kept for complex logic) --- */}
                <Dialog 
                    open={isEditOpen} 
                    onClose={() => setIsEditOpen(false)} 
                    maxWidth="sm" 
                    fullWidth
                    PaperProps={{
                        style: { borderRadius: 24, padding: 12 }
                    }}
                >
                    <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>Edit Profile</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                            <TextField
                                label="Profile Picture URL"
                                fullWidth
                                variant="outlined"
                                value={editAvatarUrl}
                                onChange={(e) => setEditAvatarUrl(e.target.value)}
                                helperText="Paste a direct link to an image"
                            />
                            
                            <TextField
                                label="Bio"
                                fullWidth
                                multiline
                                rows={3}
                                variant="outlined"
                                value={editBio}
                                onChange={(e) => setEditBio(e.target.value)}
                                placeholder="Tell us about your reading habits..."
                            />

                            <Autocomplete
                                options={searchBooks}
                                loading={searching}
                                getOptionLabel={(option) => option.title}
                                filterOptions={(x) => x}
                                onInputChange={(_, value) => handleSearchBooks(value)}
                                value={selectedBook}
                                onChange={(_, newValue) => setSelectedBook(newValue)}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Search Favorite Book"
                                        placeholder="Type to search..."
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {searching ? <CircularProgress color="inherit" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                    />
                                )}
                                renderOption={(props, option) => {
                                    const { key, ...rest } = props;
                                    return (
                                        <li key={key} {...rest}>
                                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                {option.coverUrl && (
                                                    <img src={option.coverUrl} style={{ width: 40, borderRadius: 4 }} alt="" />
                                                )}
                                                <Box>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {option.title}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {option.authors.join(', ')}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </li>
                                    );
                                }}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                        <Button onClick={() => setIsEditOpen(false)} color="inherit" sx={{ borderRadius: 2 }}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveProfile} variant="contained" sx={{ borderRadius: 2, px: 3 }}>
                            Save Changes
                        </Button>
                    </DialogActions>
                </Dialog>

            </PageLayout>
        </ThemeProvider>
    );
}