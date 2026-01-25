import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';
import {
    Typography,
    Avatar,
    Paper,
    TextField,
    Button,
    Stack,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Autocomplete,
    Box,
    Divider
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';

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

// --- Styled Components ---

const ProfileContainer = styled(Container)(({ theme }) => ({
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(8),
}));

const StatCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s',
    '&:hover': {
        transform: 'translateY(-4px)',
    }
}));

const BookCover = styled('img')({
    width: '80px',
    height: '120px',
    objectFit: 'cover',
    borderRadius: '4px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
});

export default function Profile() {
    const { id } = useParams<{ id: string }>();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Edit Modal State
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editBio, setEditBio] = useState('');
    const [editAvatarUrl, setEditAvatarUrl] = useState('');
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

    if (isLoading) return <Typography sx={{ mt: 8, textAlign: 'center' }}>Loading...</Typography>;
    if (error || !profile) return <Container maxWidth="md"><Alert severity="error" sx={{ mt: 4 }}>{error || "Profile not found"}</Alert></Container>;

    return (
        <ProfileContainer maxWidth="lg">
            <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                <Grid container spacing={4} alignItems="center">
                    <Grid size={{ xs: 12, md: 3 }} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Avatar
                            src={profile.profilePictureUrl}
                            alt={profile.displayName}
                            sx={{ width: 160, height: 160, mb: 2, boxShadow: 3, border: '4px solid white' }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 9 }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={2}>
                            <Box>
                                <Typography variant="h3" fontWeight={800} gutterBottom>
                                    {profile.displayName}
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 2, maxWidth: '600px' }}>
                                    {profile.bio || "No bio yet."}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Joined {new Date(profile.createdAt).toLocaleDateString()}
                                </Typography>
                            </Box>

                            <Box>
                                {isOwnProfile ? (
                                    <Button
                                        variant="outlined"
                                        startIcon={<EditIcon />}
                                        onClick={() => setIsEditOpen(true)}
                                    >
                                        Edit Profile
                                    </Button>
                                ) : (
                                    <Button
                                        variant={profile.isFollowing ? "outlined" : "contained"}
                                        color={profile.isFollowing ? "secondary" : "primary"}
                                        startIcon={profile.isFollowing ? <PersonRemoveIcon /> : <PersonAddIcon />}
                                        onClick={handleFollowToggle}
                                    >
                                        {profile.isFollowing ? "Unfollow" : "Follow"}
                                    </Button>
                                )}
                            </Box>
                        </Stack>

                        <Stack direction="row" spacing={4} sx={{ mt: 4 }}>
                            <Box textAlign="center">
                                <Typography variant="h6" fontWeight="bold">{profile.followersCount}</Typography>
                                <Typography variant="caption" color="text.secondary">Followers</Typography>
                            </Box>
                            <Box textAlign="center">
                                <Typography variant="h6" fontWeight="bold">{profile.followingCount}</Typography>
                                <Typography variant="caption" color="text.secondary">Following</Typography>
                            </Box>
                        </Stack>
                    </Grid>
                </Grid>
            </Paper>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Stack spacing={3} height="100%">
                        <StatCard>
                            <Typography variant="h2" color="primary.main" fontWeight={800}>
                                {profile.shelvesCount}
                            </Typography>
                            <Typography variant="subtitle1" fontWeight={600}>Shelves</Typography>
                        </StatCard>
                        <StatCard>
                            <Typography variant="h2" color="secondary.main" fontWeight={800}>
                                {profile.uniqueBooksCount}
                            </Typography>
                            <Typography variant="subtitle1" fontWeight={600}>Books Collected</Typography>
                        </StatCard>
                    </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper elevation={0} sx={{ p: 3, height: '100%', borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Favorite Book
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        {profile.favoriteBook ? (
                            <Stack direction="row" spacing={3}>
                                <BookCover src={profile.favoriteBook.coverUrl || '/placeholder-book.png'} alt={profile.favoriteBook.title} />
                                <Box>
                                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                                        {profile.favoriteBook.title}
                                    </Typography>
                                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                        {profile.favoriteBook.authors.join(', ')}
                                    </Typography>
                                </Box>
                            </Stack>
                        ) : (
                            <Box sx={{ py: 4, textAlign: 'center' }}>
                                <Typography color="text.secondary">No favorite book selected.</Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* Edit Modal */}
            <Dialog open={isEditOpen} onClose={() => setIsEditOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField
                            label="Avatar URL"
                            fullWidth
                            value={editAvatarUrl}
                            onChange={(e) => setEditAvatarUrl(e.target.value)}
                        />
                        <TextField
                            label="Bio"
                            fullWidth
                            multiline
                            rows={3}
                            value={editBio}
                            onChange={(e) => setEditBio(e.target.value)}
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
                                                {searching ? <Box sx={{ mr: 2 }}>Loading...</Box> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                            renderOption={(props, option) => (
                                <li {...props} key={option.id}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        {option.coverUrl &&
                                            <img src={option.coverUrl} style={{ width: 30, height: 45, objectFit: 'cover' }} alt="" />
                                        }
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">
                                                {option.title}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {option.authors.join(', ')}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </li>
                            )}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsEditOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveProfile} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

        </ProfileContainer>
    );
}