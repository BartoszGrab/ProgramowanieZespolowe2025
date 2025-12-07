import * as React from 'react';
import { useState } from 'react';
import { Form, useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { LoginRequest } from '../types/auth';

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
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled, ThemeProvider } from '@mui/material/styles';
import ColorModeSelect from '../customs/ColorModeSelect';
import { GoogleIcon, FacebookIcon } from '../customs/CustomIcons';
import mainTheme from '../themes/mainTheme';
import { Navigation } from '../customs/Navigation';

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


const SignInContainer = styled(Stack)(({ theme }) => ({
  paddingTop: '64px',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, #be6a0440 0%, #ffe7b8ff 100%)',
    backgroundRepeat: 'no-repeat',
  },
}));

export default function Login(props: { disableCustomTheme?: boolean }) {
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');

  // <-- navigation hook -->
  const navigate = useNavigate();

  // <-- error state hook -->
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // <-- email regex -->
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  // <-- validate form data -->
  const validate = () => {
    const email = document.getElementById('email') as HTMLInputElement;
    const password = document.getElementById('password') as HTMLInputElement;
    let isValid = true;

    // check if login request fields are not empty
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

    // check email format with regex
    if (email.value && !emailRegex.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage('Invalid email format');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
      const response = await axios.post('/api/auth/login', formData);
      console.log('Login successful:', response.data);
      localStorage.setItem('authToken', response.data.token);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login failed:', error);
      setErrors({ general: error.response?.data?.message || 'Login failed' });
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
      <SignInContainer direction="column" justifyContent="space-between">
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
            <Button
              disabled={isLoading}
              fullWidth
              sx={{ color: mainTheme.palette.secondary.dark }}
              variant="outlined"
              onClick={() => alert('Sign in with Google')}
              startIcon={<GoogleIcon />}
            >
              Sign in with Google
            </Button>
            <Button
              disabled={isLoading}
              fullWidth
              sx={{ color: mainTheme.palette.secondary.dark }}
              variant="outlined"
              onClick={() => alert('Sign in with Facebook')}
              startIcon={<FacebookIcon />}
            >
              Sign in with Facebook
            </Button>
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
      </SignInContainer>
    </ThemeProvider>
  );
}