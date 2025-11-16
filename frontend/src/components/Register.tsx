// register
import React, { use } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { RegisterRequest } from '../types/auth';

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
    
    // check if register request fields are not empty
    if (!formData.email) {
        newErrors.email = 'Email cannot be null';
    }

    if(!formData.password) {
        newErrors.password = 'Password cannot be null';
    }

    if(formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if(!formData.displayName) {
        newErrors.displayName = 'Display Name cannot be null';
    }

    // check email format with regex
    if (formData.email && !emailRegex.test(formData.email)) {
        newErrors.email = 'Invalid email format';
    }

    // check password length
    if (formData.password && formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long';
    }

    // check if password contains at least four unique characters
    if (formData.password) {
        const uniqueChars = new Set(formData.password);
        if (uniqueChars.size < 4) {
            newErrors.password = 'Password must contain at least four unique characters';
        }
    }

    // check display name length
    if (formData.displayName && (formData.displayName.length < 3 || formData.displayName.length > 30)) {
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