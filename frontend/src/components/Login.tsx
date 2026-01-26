import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

// MUI imports:
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import MuiCard from '@mui/material/Card';
import { styled, ThemeProvider } from '@mui/material/styles';

// Custom imports
import ColorModeSelect from '../customs/ColorModeSelect';
import { GoogleIcon, FacebookIcon } from '../customs/CustomIcons';
import mainTheme from '../themes/mainTheme';
import { PageLayout } from './layouts/PageLayout';
import { useAuth } from '../context/AuthContext';

/**
 * Styled card component for the login form.
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
 * The Login page component.
 * Handles user authentication via email/password and provides options for social login.
 * * @remarks
 * Uses `AuthContext` to update the global application state upon successful login.
 */
export default function Login() {
    // --- State: Form Validation ---
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');

  // --- Hooks ---
  const navigate = useNavigate();
  const { login } = useAuth();

  // --- State: Submission Status ---
  const [isLoading, setIsLoading] = useState(false);

  // Email validation regex
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;


/**
   * Validates the login form inputs.
   * Checks for empty fields and valid email format.
   * @returns {boolean} True if the form is valid, false otherwise.
   */
  const validate = () => {
    const email = document.getElementById('email') as HTMLInputElement;
    const password = document.getElementById('password') as HTMLInputElement;
    let isValid = true;

    // Reset errors
    setEmailError(false);
    setEmailErrorMessage('');
    setPasswordError(false);
    setPasswordErrorMessage('');

    // Check if fields are not empty
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

    // Check email format with regex
    if (email.value && !emailRegex.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage('Invalid email format');
      isValid = false;
    }

    return isValid;
  };

 /**
   * Handles the form submission.
   * Validates input, sends credentials to the API, and manages authentication state.
   * * @param e - The form event
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
      email: data.get('email') as string,
      password: data.get('password') as string,
    };

    setIsLoading(true);

    try {

      // Api call to login endpoint
      const response = await axios.post('/api/auth/login', formData);
      console.log('Login successful:', response.data);
      // Store the token and update auth state
      login(response.data.token);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login failed:', error);

    } finally {
      setIsLoading(false);
    }
    console.log({ email: data.get('email'), password: data.get('password') });
  };

  return (
    <ThemeProvider theme={mainTheme}>
      <CssBaseline enableColorScheme />
      <ColorModeSelect
        sx={{ position: 'fixed', top: '1rem', right: '1rem' }}
      />

      {/* --- Sign In Form --- */}
    <PageLayout>
        <Card variant="outlined">
          <Typography
            component="h1"
            variant="h4"
            sx={{
              width: '100%',
              fontSize: 'clamp(2rem, 10vw, 2.15rem)',
            }}
          >
            Sign In
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
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
                autoComplete="current-password"
                placeholder="********"
                error={passwordError}
                helperText={passwordErrorMessage}
                color={passwordError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />
            <Button
              disabled={isLoading}
              type="submit"
              fullWidth
              variant="contained"
              onClick={validate}
            >
              Sign In
            </Button>
          </Box>
          <Divider>
            <Typography sx={{ color: 'text.secondary' }}>or</Typography>
          </Divider>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          </Box>
          <Typography sx={{ textAlign: 'center' }}>
            Don't have an account?{' '}
            <Link
              href="/register"
              variant="body2"
              sx={{ alignSelf: 'center' }}
            >
              Sign up
            </Link>
          </Typography>
        </Card>
      {/* </SignInContainer> */}
      </PageLayout>
    </ThemeProvider>
  );
}