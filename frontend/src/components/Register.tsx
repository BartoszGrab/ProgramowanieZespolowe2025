// register
import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { RegisterRequest } from '../types/auth';
//MUI imports:
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
import { styled } from '@mui/material/styles';
import AppTheme from '../shared-theme/AppTheme';
import ColorModeSelect from '../shared-theme/ColorModeSelect';
import { GoogleIcon, FacebookIcon, SitemarkIcon } from './components/CustomIcons';

const Register: React.FC = () => {
// <-- form state hook -->
const [formData, setFormData] = useState<RegisterRequest>({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
});

// <-- navigation hook -->
const navigate = useNavigate();

// <-- error state hook -->
const [errors, setErrors] = useState<{[key: string]: string}>({});
const [isLoading, setisLoading] = useState(false);

// <-- handle change in form inputs -->
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
        ...formData,
        [e.target.name]: e.target.value
    });
};

// <-- email regex -->
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

//<-- validate form data -->
const validate = () => {
    const newErrors: {[key: string]: string} = {};
    const email = document.getElementById('email') as HTMLInputElement;
    const password = document.getElementById('password') as HTMLInputElement;
    const confirmPassword = document.getElementById('confirmPassword') as HTMLInputElement;
    const displayName = document.getElementById('displayName') as HTMLInputElement;
    
    // check if register request fields are not empty
    if (!email.value) {
        newErrors.email = 'Email cannot be null';
    }

    if(!password.value) {
        newErrors.password = 'Password cannot be null';
    }

    if(confirmPassword.value != password.value) {
        newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if(displayName.value.length === 0) {
        newErrors.displayName = 'Display Name cannot be null';
    }

    // check email format with regex
    if (email.value && !emailRegex.test(email.value)) {
        newErrors.email = 'Invalid email format';
    }

    // check password length
    if (password.value && password.value.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long';
    }

    // check if password contains at least four unique characters
    if (password.value) {
        const uniqueChars = new Set(password.value);
        if (uniqueChars.size < 4) {
            newErrors.password = 'Password must contain at least four unique characters';
        }
    }

    // check display name length
    if (displayName.value && (formData.displayName.length < 3 || formData.displayName.length > 30)) {
        newErrors.displayName = 'Display Name must be between 3 and 30 characters long';
    }

    return newErrors;
}

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validate(); // validation
    if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
    }
    setisLoading(true); // set loading state - turn the buttons off
    try { const response = await axios.post('/api/auth/register', formData);
        console.log('Registration successful:', response.data);
        navigate('/login'); // redirect to login page after successful registration
    } catch (error: any) {
        setErrors({ general: error.response?.data?.message || 'Registration failed' });
    } finally {
        setisLoading(false);
    }

}




return (
        <div>
            <div>
                <h1>Register Page</h1>
                <p>To jest strona rejestracji</p>
            </div>
            <form className="max-w-md mxauto mt-10 p-6 bg-gray-100 rounded-lg shadow-md" onSubmit={handleSubmit}>
                <label htmlFor="email">Email:</label>
                <input className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                {errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}
                <label htmlFor="password">Password:</label>
                <input className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                {errors.password && <p style={{ color: 'red' }}>{errors.password}</p>}
                <label htmlFor="confirmPassword">Confirm Password:</label>
                <input className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                />
                {errors.confirmPassword && <p style={{ color: 'red' }}>{errors.confirmPassword}</p>}
                <label htmlFor="displayName">Display Name:</label>
                <input className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    required
                />
                {errors.displayName && <p style={{ color: 'red' }}>{errors.displayName}</p>}
                <button type="submit" disabled={isLoading}> Register </button>
                {errors.general && <p style={{ color: 'red' }}>{errors.general}</p>}      
            </form>
        </div>
    );
};


export default Register;