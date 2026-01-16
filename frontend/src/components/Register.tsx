// register
import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

//MUI imports:
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled, ThemeProvider } from '@mui/material/styles';

// Custom imports
import ColorModeSelect from '../customs/ColorModeSelect';
import { GoogleIcon, FacebookIcon } from '../customs/CustomIcons';
import mainTheme from '../themes/mainTheme';
import { PageLayout } from './layouts/PageLayout';


/**
 * Styled card component for the registration form.
 * Centers content and adds responsive sizing and shadow effects.
 */
const Card = styled(MuiCard)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    width: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    margin: 'auto',
    boxShadow:
        'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
    [theme.breakpoints.up('sm')]: {
        width: '450px',
    },
}));

/**
 * Styled container for the registration page layout.
 * Includes responsive padding and a radial gradient background.
 */
// const SignUpContainer = styled(Stack)(({ theme }) => ({
//     paddingTop: '64px',
//     minHeight: '100%',
//     padding: theme.spacing(2),
//     [theme.breakpoints.up('sm')]: {
//         padding: theme.spacing(4),
//     },
//     '&::before': {
//         content: '""',
//         display: 'block',
//         position: 'absolute',
//         zIndex: -1,
//         inset: 0,
//         backgroundImage: 'radial-gradient(ellipse at 50% 50%, #be6a0440 0%, #ffe7b8ff 100%)',
//         backgroundRepeat: 'no-repeat',
//     },
// }));

/**
 * The Register page component.
 * Handles new user registration with form validation and API integration.
 */
export default function Register() {
    // --- State: Form Validation ---
    const [emailError, setEmailError] = React.useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
    const [passwordError, setPasswordError] = React.useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
    const [displayNameError, setDisplayNameError] = React.useState(false);
    const [displayNameErrorMessage, setDisplayNameErrorMessage] = React.useState('');

    // --- State: Submission Status ---
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setisLoading] = useState(false);

    // --- Hooks ---
    const navigate = useNavigate();

    // Email validation regex
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    /**
     * Validates the registration form inputs.
     * Checks for:
     * - Empty fields
     * - Password matching
     * - Password complexity (length, unique chars)
     * - Email format
     * - Display name length
     * 
     * @returns {boolean} True if the form is valid, false otherwise.
     */
    const validate = () => {
        const email = document.getElementById('email') as HTMLInputElement;
        const password = document.getElementById('password') as HTMLInputElement;
        const confirmPassword = document.getElementById('confirmPassword') as HTMLInputElement;
        const displayName = document.getElementById('displayName') as HTMLInputElement;

        let isValid = true;

        // Reset errors
        setEmailError(false);
        setEmailErrorMessage('');
        setPasswordError(false);
        setPasswordErrorMessage('');
        setDisplayNameError(false);
        setDisplayNameErrorMessage('');

        // Check for empty fields
        if (!email.value) {
            setEmailError(true);
            setEmailErrorMessage('Email cannot be null');
            isValid = false;
        }

        if (!password.value) {
            setPasswordError(true);
            setPasswordErrorMessage('Password cannot be null');
            isValid = false;
        }

         if (displayName.value.length === 0) {
            setDisplayNameError(true);
            setDisplayNameErrorMessage('Display Name cannot be null');
            isValid = false;
        }

        // Check password matching
        if (confirmPassword.value != password.value) {
            setPasswordError(true);
            setPasswordErrorMessage('Passwords do not match');
            isValid = false;
        }

        // Check email format with regex
        if (email.value && !emailRegex.test(email.value)) {
            setEmailError(true);
            setEmailErrorMessage('Invalid email format');
            isValid = false;
        }

        // Check password complexity
        if (password.value && password.value.length < 8) {
            setPasswordError(true);
            setPasswordErrorMessage('Password must be at least 8 characters long');
            isValid = false;
        }

        // -- Check if password contains at least four unique characters
        if (password.value) {
            const uniqueChars = new Set(password.value);
            if (uniqueChars.size < 4) {
                setPasswordError(true);
                setPasswordErrorMessage('Password must contain at least four unique characters');
                isValid = false;
            }
        }

        // Check display name length
        if (displayName.value && (displayName.value.length < 3 || displayName.value.length > 30)) {
            setDisplayNameError(true);
            setDisplayNameErrorMessage('Display Name must be between 3 and 30 characters long');
            isValid = false;
        }

        return isValid;
    };

    /**
     * Handles the form submission.
     * Validates input, sends registration data to the API, and redirects on success.
     * @param e - The form event
     */
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Validate form inputs
        if (!validate()) {
            e.preventDefault();
            return;
        }

        const data = new FormData(e.currentTarget);
        const formData = {
            displayName: data.get('displayName') as string,
            email: data.get('email') as string,
            password: data.get('password') as string,
            confirmPassword: data.get('confirmPassword') as string,
        }

        setisLoading(true);
        setErrors({}); // Clear previous API errors
        
        try {
            // API Call
            const response = await axios.post('/api/auth/register', formData);
            console.log('Registration successful:', response.data);
            
            // Navigate to login page after successful registration
            navigate('/login');
        } catch (error: any) {
            console.error('Registration failed:', error);
            setErrors({ general: error.response?.data?.message || 'Registration failed' });
        } finally {
            setisLoading(false);
        }

        console.log({
            email: data.get('email'),
            password: data.get('password'),
            confirmPassword: data.get('confirmPassword'),
            displayName: data.get('displayName'),
        });


    };




    return (
        <ThemeProvider theme={mainTheme}>
            <CssBaseline enableColorScheme />
            <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
            { /** --- Sing up Form --- */ }
            {/* <SignUpContainer direction="column" justifyContent="space-between"> */}
            <PageLayout>
                <Card variant="outlined">
                    <Typography
                        component="h1"
                        variant="h4"
                        sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
                    >
                        Sign Up
                    </Typography>
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                    >
                        <FormControl>
                            <FormLabel htmlFor="displayName">Your nickname</FormLabel>
                            <TextField
                                autoComplete="displayName"
                                name="displayName"
                                required
                                fullWidth
                                id="displayName"
                                placeholder="CoolNickname123"
                                error={displayNameError}
                                helperText={displayNameErrorMessage}
                                color={displayNameError ? 'error' : 'primary'}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel htmlFor="email">Email address</FormLabel>
                            <TextField
                                variant="outlined"
                                autoComplete="email"
                                name="email"
                                required
                                fullWidth
                                id="email"
                                placeholder="your@email.com"
                                error={emailError}
                                helperText={emailErrorMessage}
                                color={emailError ? 'error' : 'primary'}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel htmlFor="password">Password</FormLabel>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                name="password"
                                type="password"
                                id="password"
                                auto-complete="new-password"
                                placeholder="********"
                                error={passwordError}
                                helperText={passwordErrorMessage}
                                color={passwordError ? 'error' : 'primary'}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                name="confirmPassword"
                                type="password"
                                id="confirmPassword"
                                auto-complete="new-password"
                                placeholder="********"
                                error={passwordError}
                                helperText={passwordErrorMessage}
                                color={passwordError ? 'error' : 'primary'}
                            />
                        </FormControl>
                        <FormControlLabel
                            control={<Checkbox value="agreeTerms" color="primary" />}
                            label="I want to sell my soul for marketing purposes."
                        />
                        <Button
                            disabled={isLoading}
                            type="submit"
                            fullWidth
                            variant="contained"
                            onClick={validate}
                        >
                            Sign Up
                        </Button>
                        {errors.general && (
                            <Typography color="error" variant="body2" align="center" sx={{ mt: 1 }}>
                                {errors.general}
                            </Typography>
                        )}
                    </Box>
                    <Divider>
                        <Typography sx={{ color: 'text.secondary' }}>or</Typography>
                    </Divider>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Button
                            disabled={isLoading}
                            fullWidth
                            sx={{ color: mainTheme.palette.secondary.dark }}
                            variant="outlined"
                            onClick={() => alert('Sign up with Google')}
                            startIcon={<GoogleIcon />}
                        >
                            Sign up with Google
                        </Button>
                        <Button
                            disabled={isLoading}
                            fullWidth
                            sx={{ color: mainTheme.palette.secondary.dark }}
                            variant="outlined"
                            onClick={() => alert('Sign up with Facebook')}
                            startIcon={<FacebookIcon />}
                        >
                            Sign up with Facebook
                        </Button>
                    </Box>
                </Card>
            {/* </SignUpContainer> */}
            </PageLayout>
        </ThemeProvider>
    );
};

