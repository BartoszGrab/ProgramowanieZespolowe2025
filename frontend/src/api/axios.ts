import axios from 'axios';

/**
 * Main Axios instance for the application.
 * configured with a base URL and interceptors.
 *
 * @remarks
 * The baseURL is empty to allow proxying via Vite or Nginx.
 */
const api = axios.create({
    baseURL: '', // Proxy handles the domain
});

// Request interceptor for API calls
/**
 * Intercepts outgoing requests to inject the Authorization header.
 * Checks localStorage for 'authToken' and appends it as a Bearer token.
 *
 * @param config - The Axios request configuration object.
 * @returns The modified configuration or the original one.
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
