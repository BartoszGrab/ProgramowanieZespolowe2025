import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// MUI imports
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid'; // Grid v2 (MUI v6)
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PeopleIcon from '@mui/icons-material/People';

import mainTheme from '../themes/mainTheme';
import { PageLayout } from '../components/layouts/PageLayout'; 

// Nowoczesna karta "Action Card"
const ActionCard = ({ icon: Icon, title, subtitle, onClick, delay }: any) => (
    <div 
        onClick={onClick}
        className={`
            group relative h-full min-h-55px flex flex-col justify-center items-start text-left p-8 cursor-pointer
            bg-white/70 backdrop-blur-md
            border border-primary-light/30 rounded-3xl
            shadow-sm hover:shadow-2xl hover:shadow-primary-main/10 hover:-translate-y-1
            transition-all duration-500 ease-out overflow-hidden
        `}
        style={{ animationDelay: delay }}
    >
        {/* Dekoracyjne tło hover (subtelny gradient) */}
        <div className="absolute inset-0 bg-linear-to-br from-primary-light/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Ikona w "bąbelku" */}
        <div className="relative z-10 mb-6 p-4 rounded-2xl bg-primary-light/20 text-primary-dark group-hover:scale-110 group-hover:bg-primary-dark group-hover:text-white transition-all duration-300">
            <Icon sx={{ fontSize: 32 }} />
        </div>

        {/* Tekst */}
        <h3 className="relative z-10 text-xl font-bold text-text-primary mb-2 group-hover:brightness-75 group-hover:text-primary-dark transition-colors">
            {title}
        </h3>
        <p className="relative z-10 text-sm text-text-secondary opacity-80 leading-relaxed">
            {subtitle}
        </p>

        {/* Strzałka dekoracyjna, która pojawia się przy hover */}
        <div className="absolute bottom-6 right-6 opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary-main font-bold text-xl">
            →
        </div>
    </div>
);

export default function Home() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem('authToken'));
    }, []);

    const handleCardClick = (path: string) => {
        navigate(path);
    };

    return (
        <ThemeProvider theme={mainTheme}>
            <CssBaseline enableColorScheme />
            
            <PageLayout>
                {/* --- Hero Section --- */}
                <Box className="mb-20 mt-8 w-full text-center flex flex-col items-center relative z-10">
                    {/* Główny Tytuł z Gradientem */}
                    <Typography
                        component="h1"
                        variant="h2"
                        className="mb-6 tracking-tight drop-shadow-sm"
                        sx={{ fontSize: { xs: '2.5rem', md: '3.75rem' } }}
                    >
                        <span className="text-teal-50/80 font-medium">Welcome to  </span>
                        <br className="sm:hidden" />
                        <span className="font-medium text-transparent bg-clip-text bg-linear-to-r from-primary-main to-primary-light/90">
                            Your Virtual Library
                        </span> 📚
                    </Typography>

                    <Typography variant="h6" className="text-teal-50 max-w-2xl leading-relaxed text-lg font-light">
                        Create your own shelves, collect books, and organize your reading journey effortlessly in a beautiful space.
                    </Typography>
                </Box>

                {/* --- Cards Grid --- */}
                <Box className="max-w-5xl mx-auto">
                    <Grid container spacing={4} justifyContent="center">
                        {isLoggedIn ? (
                            <>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <ActionCard 
                                        icon={DashboardIcon}
                                        title="Dashboard"
                                        subtitle="Manage your shelves and track reading progress."
                                        onClick={() => handleCardClick('/dashboard')}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <ActionCard 
                                        icon={LibraryBooksIcon}
                                        title="Recommendations"
                                        subtitle="Get AI-powered book suggestions just for you."
                                        onClick={() => handleCardClick('/recommendations')}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <ActionCard 
                                        icon={PeopleIcon}
                                        title="Community"
                                        subtitle="Connect with other readers and share reviews."
                                        onClick={() => handleCardClick('/community')}
                                    />
                                </Grid>
                            </>
                        ) : (
                            <>
                                <Grid size={{ xs: 12, sm: 6, md: 5 }}>
                                    <ActionCard 
                                        icon={LoginIcon}
                                        title="Login"
                                        subtitle="Access your existing collection <3."
                                        onClick={() => handleCardClick('/login')}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 5 }}>
                                    <ActionCard 
                                        icon={PersonAddIcon}
                                        title="Register"
                                        subtitle="Start your journey today. It's free!"
                                        onClick={() => handleCardClick('/register')}
                                    />
                                </Grid>
                            </>
                        )}
                    </Grid>
                </Box>
            </PageLayout>
        </ThemeProvider>
    );
}