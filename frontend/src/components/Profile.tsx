import { useEffect, useState } from 'react';
import axios from '../api/axios';
import {
    Typography,
    Avatar,
    Grid,
    TextField,
    Button,
    Stack,
    Alert,
    Box,
    CssBaseline
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import mainTheme from '../themes/mainTheme';
import { PageLayout } from '../components/layouts/PageLayout'; // Zakładam, że masz ten layout dostępny
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import MenuBookIcon from '@mui/icons-material/MenuBook';

// --- Interfejsy ---
interface UserProfile {
    id: string;
    displayName: string;
    email: string;
    profilePictureUrl?: string;
    shelvesCount: number;
    uniqueBooksCount: number;
    createdAt: string;
}

// --- Komponent Statystyki (Stylizowany na ActionCard z Home) ---
const StatCard = ({ icon: Icon, value, label, delay }: any) => (
    <div
        className={`
            group relative h-full flex flex-col justify-center items-center text-center p-6
            bg-white/70 backdrop-blur-md
            border border-primary-light/30 rounded-3xl
            shadow-sm hover:shadow-xl hover:shadow-primary-main/10 hover:-translate-y-1
            transition-all duration-500 ease-out overflow-hidden
        `}
        style={{ animationDelay: delay }}
    >
        {/* Dekoracyjne tło hover */}
        <div className="absolute inset-0 bg-linear-to-br from-primary-light/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Ikona */}
        <div className="relative z-10 mb-3 p-3 rounded-full bg-primary-light/10 bg-linear-to-r from-primary-main to-primary-dark group-hover:bg-primary-main group-hover:text-white transition-all duration-300">
            <Icon sx={{ fontSize: 28 }} />
        </div>

        {/* Wartość z Gradientem */}
        <span className="relative z-10 text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-primary-main to-primary-dark mb-1">
            {value}
        </span>

        {/* Etykieta */}
        <span className="relative z-10 text-sm bg-clip-text text-transparent bg-linear-to-r from-primary-main to-primary-dark brightness-75 font-medium uppercase tracking-wider opacity-80">
            {label}
        </span>
    </div>
);

export default function Profile() {
    // --- State ---
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [newAvatarUrl, setNewAvatarUrl] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // --- Data Fetching ---
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

    useEffect(() => {
        fetchProfile();
    }, []);

    // --- Handlers ---
    const handleAvatarUpdate = async () => {
        try {
            await axios.put('/api/users/me/avatar', { profilePictureUrl: newAvatarUrl });
            setMessage({ type: 'success', text: 'Avatar updated successfully!' });

            // Optimistic update
            if (profile) {
                setProfile({ ...profile, profilePictureUrl: newAvatarUrl });
            }
        } catch (error: any) {
            console.error("Failed to update avatar", error);
            setMessage({ type: 'error', text: 'Failed to update avatar. Please check the URL.' });
        }
    };

    // --- Render Loading/Error ---
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-text-secondary">
                <Typography variant="h6">Loading profile...</Typography>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center text-text-secondary">
                <Typography variant="h6">Profile not found.</Typography>
            </div>
        );
    }

    return (
        <ThemeProvider theme={mainTheme}>
            <CssBaseline enableColorScheme />
            <PageLayout>
                <Box className="max-w-4xl mx-auto py-8 px-4">

                    {/* --- Header: User Details Card --- */}
                    <div className="mb-8 p-8 md:p-10 bg-white/70 backdrop-blur-md border border-primary-light/30 rounded-3xl shadow-sm relative overflow-hidden">
                        {/* Dekoracyjny gradient w tle karty */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-main/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        <Grid container spacing={6} alignItems="center" className="relative z-10">
                            
                            {/* Left: Avatar & Info */}
                            <Grid size={{ xs: 12, md: 5 }} className="flex flex-col items-center md:items-start text-center md:text-left">
                                <div className="relative mb-6 group">
                                    <div className="absolute -inset-1 bg-linear-to-r from-primary-main to-secondary-main rounded-full opacity-70 blur-sm group-hover:opacity-100 transition duration-500"></div>
                                    <Avatar
                                        alt={profile.displayName}
                                        src={profile.profilePictureUrl}
                                        sx={{ width: 140, height: 140, border: '4px solid white' }}
                                        className="relative shadow-xl"
                                    />
                                </div>
                                
                                <Typography variant="h4" className="font-bold text-text-primary mb-1">
                                    {profile.displayName}
                                </Typography>
                                <Typography variant="body1" className="text-text-secondary mb-2">
                                    {profile.email}
                                </Typography>
                                <div className="inline-flex items-center py-1 rounded-full bg-primary-light/10 text-primary-dark text-xs font-medium">
                                    Joined: {new Date(profile.createdAt).toLocaleDateString()}
                                </div>
                            </Grid>

                            {/* Right: Settings / Update Form */}
                            <Grid size={{ xs: 12, md: 7 }}>
                                <div className="bg-white/50 rounded-2xl p-6 border border-primary-light/20">
                                    <Typography variant="h6" className="font-bold text-text-primary mb-2">
                                        Update Avatar
                                    </Typography>
                                    <Typography variant="body2" className="text-text-secondary mb-4 opacity-80">
                                        Paste a URL to an image to set your profile picture.
                                    </Typography>

                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                        <TextField
                                            fullWidth
                                            label="Image URL"
                                            variant="outlined"
                                            size="small"
                                            value={newAvatarUrl}
                                            onChange={(e) => setNewAvatarUrl(e.target.value)}
                                            sx={{ 
                                                bgcolor: 'white',
                                                '& .MuiOutlinedInput-root': { borderRadius: '12px' } 
                                            }}
                                        />
                                        <Button 
                                            variant="contained" 
                                            onClick={handleAvatarUpdate}
                                            disableElevation
                                            sx={{ 
                                                borderRadius: '12px',
                                                textTransform: 'none',
                                                fontWeight: 'bold',
                                                px: 4
                                            }}
                                        >
                                            Save
                                        </Button>
                                    </Stack>

                                    {message && (
                                        <Alert 
                                            severity={message.type} 
                                            sx={{ mt: 2, borderRadius: '12px' }}
                                        >
                                            {message.text}
                                        </Alert>
                                    )}
                                </div>
                            </Grid>
                        </Grid>
                    </div>

                    {/* --- Section: Statistics --- */}
                    <Grid container spacing={4}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <StatCard
                                icon={CollectionsBookmarkIcon}
                                value={profile.shelvesCount}
                                label="Shelf Collections"
                                delay="0.1s"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <StatCard
                                icon={MenuBookIcon}
                                value={profile.uniqueBooksCount}
                                label="Unique Books"
                                delay="0.2s"
                            />
                        </Grid>
                    </Grid>

                </Box>
            </PageLayout>
        </ThemeProvider>
    );
}