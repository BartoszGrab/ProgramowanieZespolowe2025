import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

// MUI imports
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import CssBaseline from '@mui/material/CssBaseline';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Divider from '@mui/material/Divider';
import { ThemeProvider } from '@mui/material/styles';

// Icons
import PeopleIcon from '@mui/icons-material/People';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import SearchIcon from '@mui/icons-material/Search';

// Custom imports
import mainTheme from '../themes/mainTheme';
import { PageLayout } from './layouts/PageLayout';

/**
 * Data Transfer Object representing a user in the community.
 */
interface UserCommunityDto {
    id: string;
    displayName: string;
    bio?: string;
    profilePictureUrl?: string;
    followersCount: number;
    followingCount: number;
    isFollowing: boolean;
}

/**
 * Komponent karty użytkownika (Glassmorphism style - spójny z Dashboard/Recommendations)
 */
const UserCommunityCard = ({ user, onClick, onFollow }: { user: UserCommunityDto, onClick: () => void, onFollow: (e: React.MouseEvent) => void }) => (
    <div
        onClick={onClick}
        className={`
            group relative flex flex-col items-center p-6 cursor-pointer h-full
            bg-white/70 backdrop-blur-md
            border border-white/40 rounded-3xl
            shadow-lg hover:shadow-2xl hover:shadow-primary-main/20 hover:-translate-y-2
            transition-all duration-300 ease-out overflow-hidden
        `}
    >
        {/* Dekoracyjne tło hover */}
        <div className="absolute inset-0 bg-linear-to-br from-primary-light/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Avatar Section */}
        <div className="relative z-10 mb-4">
            <Avatar
                src={user.profilePictureUrl}
                alt={user.displayName}
                sx={{ 
                    width: 90, 
                    height: 90, 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: '3px solid rgba(255,255,255,0.8)' 
                }}
                className="group-hover:scale-105 transition-transform duration-300"
            />
        </div>

        {/* Content Section */}
        <div className="relative z-10 flex flex-col items-center text-center w-full flex-grow">
            <h3 className="text-xl font-bold text-gray-900 mb-1 truncate w-full px-2">
                {user.displayName}
            </h3>
            
            <p className="text-sm text-gray-600 font-medium line-clamp-2 mb-4 h-10 w-full px-2">
                {user.bio || 'No bio available'}
            </p>

            {/* Stats Row */}
            <div className="flex items-center justify-center gap-4 w-full mb-5 bg-white/40 rounded-xl py-2 mx-2">
                <div className="text-center">
                    <span className="block text-sm font-bold text-gray-900">{user.followersCount}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Followers</span>
                </div>
                <div className="h-8 w-px bg-gray-300/50"></div>
                <div className="text-center">
                    <span className="block text-sm font-bold text-gray-900">{user.followingCount}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Following</span>
                </div>
            </div>

            {/* Action Button */}
            <div className="mt-auto w-full px-2">
                <Button
                    variant={user.isFollowing ? "outlined" : "contained"}
                    color={user.isFollowing ? "secondary" : "primary"}
                    startIcon={user.isFollowing ? <PersonRemoveIcon /> : <PersonAddIcon />}
                    onClick={onFollow}
                    fullWidth
                    sx={{ 
                        borderRadius: 3, 
                        fontWeight: 'bold', 
                        textTransform: 'none',
                        boxShadow: 'none',
                        '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }
                    }}
                >
                    {user.isFollowing ? 'Unfollow' : 'Follow'}
                </Button>
            </div>
        </div>
    </div>
);

export default function Community() {
    // --- State ---
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<UserCommunityDto[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    // Debounce search input
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchUsers(searchQuery);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    /**
     * Retrieves the list of all community members or search results from the backend.
     */
    const fetchUsers = async (query = '') => {
        setIsLoading(true);
        setError(null);
        try {
            const endpoint = query ? `/api/users/search?q=${encodeURIComponent(query)}` : '/api/users';
            const response = await axios.get<UserCommunityDto[]>(endpoint);
            setUsers(response.data);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Could not load community members. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Toggles the follow status for a specific user.
     */
    const handleFollowToggle = async (user: UserCommunityDto, event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent navigation when clicking follow button
        try {
            if (user.isFollowing) {
                // Optimistic update: Unfollow
                await axios.delete(`/api/users/${user.id}/follow`);
                setUsers(prevUsers => prevUsers.map(u =>
                    u.id === user.id
                        ? { ...u, isFollowing: false, followersCount: u.followersCount - 1 }
                        : u
                ));
            } else {
                // Optimistic update: Follow
                await axios.post(`/api/users/${user.id}/follow`);
                setUsers(prevUsers => prevUsers.map(u =>
                    u.id === user.id
                        ? { ...u, isFollowing: true, followersCount: u.followersCount + 1 }
                        : u
                ));
            }
        } catch (err) {
            console.error('Error toggling follow:', err);
            // Revert optimistic update ideally here, but keeping it simple for now
        }
    };

    const handleCardClick = (userId: string) => {
        navigate(`/user/${userId}`);
    };

    return (
        <ThemeProvider theme={mainTheme}>
            <CssBaseline enableColorScheme />
            
            <PageLayout>
                
                {/* --- Header Section --- */}
                <div className="w-full max-w-7xl mx-auto mb-8 pl-2 animate-fade-in">
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/')}
                        sx={{ mb: 3, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                    >
                        Back to Home
                    </Button>
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-sm">
                                <PeopleIcon sx={{ fontSize: 36 }} className="text-gray-800" />
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight drop-shadow-sm">
                                    Community
                                </h1>
                                <p className="text-gray-700 font-medium text-sm sm:text-base">
                                    Connect with other readers
                                </p>
                            </div>
                        </div>

                        {/* Search Bar - Stylized */}
                        <div className="w-full md:w-auto md:min-w-[300px]">
                             <TextField
                                fullWidth
                                placeholder="Search by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon color="action" />
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            borderRadius: 4,
                                            backgroundColor: 'rgba(255, 255, 255, 0.6)',
                                            backdropFilter: 'blur(10px)',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                            },
                                            '&.Mui-focused': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            }
                                        }
                                    }
                                }}
                                variant="outlined"
                                size="small"
                            />
                        </div>
                    </div>
                </div>

                {/* --- Content Section --- */}
                <div className="w-full max-w-7xl mx-auto pb-10">
                    
                    {/* Loading */}
                    {isLoading && (
                        <div className="flex flex-col justify-center items-center mt-20 gap-4">
                            <CircularProgress size={60} thickness={4} sx={{ color: 'white' }} />
                            <p className="text-white font-medium text-lg drop-shadow-md">Loading community...</p>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <Alert severity="error" className="mb-8 shadow-md rounded-xl backdrop-blur-md bg-red-100/90">
                            {error}
                        </Alert>
                    )}

                    {/* Empty State */}
                    {!isLoading && !error && users.length === 0 && (
                        <div className="flex flex-col items-center justify-center p-12 text-center bg-white/40 backdrop-blur-md rounded-3xl border border-white/40 shadow-xl max-w-2xl mx-auto">
                            <PeopleIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 3, opacity: 0.5 }} />
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">No users found</h2>
                            <p className="text-gray-700 mb-0 max-w-md">
                                Try searching for a different name or come back later!
                            </p>
                        </div>
                    )}

                    {/* Grid System (Tailwind) */}
                    {!isLoading && !error && users.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {users.map((user) => (
                                <UserCommunityCard 
                                    key={user.id} 
                                    user={user} 
                                    onClick={() => handleCardClick(user.id)}
                                    onFollow={(e) => handleFollowToggle(user, e)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </PageLayout>
        </ThemeProvider>
    );
}