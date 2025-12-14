import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

// MUI imports
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import CssBaseline from '@mui/material/CssBaseline';
import Button from '@mui/material/Button';
import { styled, ThemeProvider } from '@mui/material/styles';
import PeopleIcon from '@mui/icons-material/People';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';

// Custom imports
import ColorModeSelect from '../customs/ColorModeSelect';
import mainTheme from '../themes/mainTheme';


/**
 * Data Transfer Object representing a user in the community.
 */
interface UserCommunityDto {
    /** Unique identifier for the user */
    id: string;
    /** Publicly visible name */
    displayName: string;
    /** Short user biography */
    bio?: string;
    /** URL to the user's avatar image */
    profilePictureUrl?: string;
    /** Total number of users following this user */
    followersCount: number;
    /** Total number of users this user is following */
    followingCount: number;
    /** Indicates if the currently logged-in user is following this user */
    isFollowing: boolean;
}

/**
 * Styled container for the entire page layout.
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
 * Styled card component for individual user profiles.
 * Adds hover effects (lift and shadow) for better interactivity.
 */
const UserCard = styled(MuiCard)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    border: '1px solid',
    borderColor: theme.palette.divider,
    boxShadow: 'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: 'hsla(220, 30%, 5%, 0.1) 0px 15px 25px 0px',
        borderColor: theme.palette.primary.main,
    },
}));

/**
 * The Community page component.
 * Displays a grid of users and allows the current user to follow/unfollow them.
 */
export default function Community() {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<UserCommunityDto[]>([]);
    const navigate = useNavigate();

    /**
     * Initial data fetch on component mount.
     */
    useEffect(() => {
        fetchUsers();
    }, []);

    /**
     * Retrieves the list of all community members from the backend.
     */
    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get<UserCommunityDto[]>('/api/users');
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
     * Performs an optimistic UI update to ensure the interface feels snappy,
     * updating the `isFollowing` state and `followersCount` immediately.
     * 
     * @param user - The user object to follow or unfollow
     */    
    const handleFollowToggle = async (user: UserCommunityDto) => {
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
            // Optionally show user feedback
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
                        <PeopleIcon fontSize="large" color="primary" />
                        Community
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                        Connect with other readers and discover new friends
                    </Typography>
                </Box>

                {/* --- Section: Main Content --- */}
                <Box sx={{ width: '100%', maxWidth: '1200px', mx: 'auto' }}>

                    {/* Loading State */}
                    {isLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                            <CircularProgress />
                        </Box>
                    )}

                    {/* Error State */}
                    {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

                    {/* Empty State */}
                    {!isLoading && !error && users.length === 0 && (
                        <Typography variant="h6" align="center" color="text.secondary" sx={{ mt: 4 }}>
                            No users found. Be the first to invite your friends!
                        </Typography>
                    )}
                    
                    {/* Users Grid */}
                    <Grid container spacing={3}>
                        {users.map((user) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={user.id}>
                                <UserCard>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                                        <Avatar
                                            src={user.profilePictureUrl}
                                            alt={user.displayName}
                                            sx={{ width: 80, height: 80, mb: 2 }}
                                        />
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                                            {user.displayName}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 1 }}>
                                            {user.bio || 'No bio available'}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                <strong>{user.followersCount}</strong> Followers
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                <strong>{user.followingCount}</strong> Following
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'center' }}>
                                        <Button
                                            variant={user.isFollowing ? "outlined" : "contained"}
                                            color={user.isFollowing ? "secondary" : "primary"}
                                            startIcon={user.isFollowing ? <PersonRemoveIcon /> : <PersonAddIcon />}
                                            onClick={() => handleFollowToggle(user)}
                                            fullWidth
                                        >
                                            {user.isFollowing ? 'Unfollow' : 'Follow'}
                                        </Button>
                                    </Box>
                                </UserCard>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </PageContainer>
        </ThemeProvider>
    );
}
