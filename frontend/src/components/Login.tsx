import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { LoginRequest } from '../types/auth';

const Login: React.FC = () => {
  // State for form data
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: ''
  });

  // Navigation
  const navigate = useNavigate();

  // State for errors
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  // Handling input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Regex for email validation
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  // Validation
  const validate = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.email) {
      newErrors.email = 'Email cannot be null';
    }

    if (!formData.password) {
      newErrors.password = 'Password cannot be null';
    }

    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    return newErrors;
  };

  // Obsługa wysłania formularza
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post('/api/auth/login', formData);
      console.log('Login successful:', response.data);
      localStorage.setItem('authToken', response.data.token);
      navigate('/dashboard');
    } catch (error: any) {
      setErrors({ general: error.response?.data?.message || 'Login failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div>
        <h1>Login Page</h1>
        <p>To jest strona logowania</p>
      </div>
      <form className="max-w-md mx-auto mt-10 p-6 bg-gray-100 rounded-lg shadow-md" onSubmit={handleSubmit}>
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
        <button type="submit" disabled={isLoading}>Login</button>
        {errors.general && <p style={{ color: 'red' }}>{errors.general}</p>}
        <p>
          Don't have an account? <button onClick={() => navigate('/register')}>Register here</button>
        </p>
      </form>
    </div>
  );
};

export default Login;