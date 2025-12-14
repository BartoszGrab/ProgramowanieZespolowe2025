import { useEffect, useState } from 'react';
import axios from '../api/axios';
import {
    Typography,
    Container,
    Avatar,
    Grid,
    Paper,
    TextField,
    Button,
    Stack,
    Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';

/**
 * Styled container for the profile page layout.
 * Adds vertical padding for spacing.
 */
const ProfileContainer = styled(Container)(({ theme }) => ({
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
}));

/**
 * Styled paper component for displaying user statistics.
 * Centers content and adds a subtle shadow for depth.
 */
const StatCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: 'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px',
}));

/**
 * Data Transfer Object representing the current user's profile.
 */
interface UserProfile {
    /** Unique identifier for the user */
    id: string;
    /** Publicly visible name */
    displayName: string;
    /** Email address associated with the account */
    email: string;
    /** URL to the user's avatar image */
    profilePictureUrl?: string;
    /** Total number of shelves created by the user */
    shelvesCount: number;
    /** Total number of unique books across all shelves */
    uniqueBooksCount: number;
    /** Date when the user account was created */
    createdAt: string;
}

/**
 * The Profile page component.
 * Displays user details, statistics, and allows avatar updates.
 */
export default function Profile() {
    // --- State: Profile Data ---
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // --- State: Avatar Update ---
    const [newAvatarUrl, setNewAvatarUrl] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    /**
     * Fetches the current user's profile data from the backend on mount.
     */
    const fetchProfile = async () => {
        try {
            const response = await axios.get('/api/users/me');
            setProfile(response.data);
            setNewAvatarUrl(response.data.profilePictureUrl || '');
        } catch (error) {
            console.error("Failed to fetch profile", error);
            setMessage({ type: 'error', text: 'Failed to load profile data.' });
        } finally {
            setIsLoading(false);
        }
    };

    // --- Effects ---
    useEffect(() => {
        fetchProfile();
    }, []);

    /**
     * Updates the user's profile picture URL.
     * Sends the new URL to the backend and updates local state on success.
     */
    const handleAvatarUpdate = async () => {
        try {
            await axios.put('/api/users/me/avatar', { profilePictureUrl: newAvatarUrl });
            setMessage({ type: 'success', text: 'Avatar updated successfully!' });
            
            // Optimistically update local state to reflect changes immediately
            if (profile) {
                setProfile({ ...profile, profilePictureUrl: newAvatarUrl });
            }
        } catch (error: any) {
            console.error("Failed to update avatar", error);
            setMessage({ type: 'error', text: 'Failed to update avatar. Please check the URL.' });
        }
    };

    // --- Render: Loading & Error States ---
    if (isLoading) return <Typography sx={{ mt: 4, textAlign: 'center' }}>Loading profile...</Typography>;
    if (!profile) return <Typography sx={{ mt: 4, textAlign: 'center' }}>Profile not found.</Typography>;

    return (
        <ProfileContainer maxWidth="md">
            {/* --- Section: User Details & Settings --- */}
            <Paper sx={{ p: 4, mb: 4 }}>
                <Grid container spacing={4} alignItems="center">
                    {/* Left Column: Avatar & Info */}
                    <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Avatar
                            alt={profile.displayName}
                            src={profile.profilePictureUrl}
                            sx={{ width: 150, height: 150, mb: 2, boxShadow: 3 }}
                        />
                        <Typography variant="h5" fontWeight="bold">{profile.displayName}</Typography>
                        <Typography variant="body2" color="text.secondary">{profile.email}</Typography>
                        <Typography variant="caption" sx={{ mt: 1 }}>Joined: {new Date(profile.createdAt).toLocaleDateString()}</Typography>
                    </Grid>

                    {/* Right Column: Update Form */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Typography variant="h6" gutterBottom>Update Avatar</Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Paste a URL to an image to set your profile picture.
                        </Typography>
                        <Stack direction="row" spacing={2}>
                            <TextField
                                fullWidth
                                label="Image URL"
                                variant="outlined"
                                size="small"
                                value={newAvatarUrl}
                                onChange={(e) => setNewAvatarUrl(e.target.value)}
                            />
                            <Button variant="contained" onClick={handleAvatarUpdate}>Save</Button>
                        </Stack>
                        {message && (
                            <Alert severity={message.type} sx={{ mt: 2 }}>
                                {message.text}
                            </Alert>
                        )}
                    </Grid>
                </Grid>
            </Paper>

            <Grid container spacing={3}>

                {/* --- Section: Statistics --- */}
                <Grid size={{ xs: 12, sm: 6 }}>
                    <StatCard>
                        <Typography variant="h3" color="primary" fontWeight="bold">
                            {profile.shelvesCount}
                        </Typography>
                        <Typography variant="subtitle1">Shelf Collections</Typography>
                    </StatCard>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <StatCard>
                        <Typography variant="h3" color="secondary" fontWeight="bold">
                            {profile.uniqueBooksCount}
                        </Typography>
                        <Typography variant="subtitle1">Unique Books Collected</Typography>
                    </StatCard>
                </Grid>
            </Grid>
        </ProfileContainer>
    );
}
