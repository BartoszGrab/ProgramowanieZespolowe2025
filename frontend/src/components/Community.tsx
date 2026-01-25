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
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
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
        cursor: 'pointer'
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
        }
    };

    const handleCardClick = (userId: string) => {
        navigate(`/user/${userId}`);
    };

    return (
        <ThemeProvider theme={mainTheme}>
            <CssBaseline enableColorScheme />
            <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 10 }} />

            <PageContainer>
                {/* --- Section: Header --- */}
                <Box sx={{ mb: 4, width: '100%', maxWidth: '1200px', mx: 'auto', textAlign: 'center' }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/')}
                        sx={{ mb: 2, display: 'inline-flex', alignSelf: 'flex-start' }}
                    >
                        Back to Home
                    </Button>
                    <Typography
                        component="h1"
                        variant="h4"
                        sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}
                    >
                        <PeopleIcon fontSize="large" color="primary" />
                        Community
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        Connect with other readers and discover new friends
                    </Typography>

                    {/* Search Bar */}
                    <Box sx={{ maxWidth: 500, mx: 'auto' }}>
                        <TextField
                            fullWidth
                            label="Search users..."
                            variant="outlined"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name or email"
                            sx={{
                                backgroundColor: 'background.paper',
                            }}
                        />
                    </Box>
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
                            No users found.
                        </Typography>
                    )}

                    {/* Users Grid */}
                    <Grid container spacing={3}>
                        {users.map((user) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={user.id}>
                                <UserCard onClick={() => handleCardClick(user.id)}>
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
                                        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                                            <Box textAlign="center">
                                                <Typography variant="subtitle2" fontWeight="bold">{user.followersCount}</Typography>
                                                <Typography variant="caption" color="text.secondary">Followers</Typography>
                                            </Box>
                                            <Divider orientation="vertical" flexItem />
                                            <Box textAlign="center">
                                                <Typography variant="subtitle2" fontWeight="bold">{user.followingCount}</Typography>
                                                <Typography variant="caption" color="text.secondary">Following</Typography>
                                            </Box>
                                        </Stack>
                                    </Box>
                                    <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'center' }}>
                                        <Button
                                            variant={user.isFollowing ? "outlined" : "contained"}
                                            color={user.isFollowing ? "secondary" : "primary"}
                                            startIcon={user.isFollowing ? <PersonRemoveIcon /> : <PersonAddIcon />}
                                            onClick={(e) => handleFollowToggle(user, e)}
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
