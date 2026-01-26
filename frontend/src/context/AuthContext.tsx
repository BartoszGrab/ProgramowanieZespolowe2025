import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

/**
 * Defines the shape of the authentication context data.
 */
interface AuthContextType {
    /** Indicates whether the user is currently authenticated. */
    isLoggedIn: boolean;
    /**
     * Updates the state to logged in and persists the token.
     * @param token - The authentication token to store.
     */
    login: (token: string) => void;
    /**
     * Clears the authentication data and updates the state to logged out.
     */
    logout: () => void;
}

// Create the context with undefined as the initial value.
// It will be populated by the AuthProvider.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * The provider component that wraps the application or part of the component tree.
 * It manages the authentication state and handles persistence via localStorage.
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    // 'isLoading' tracks if we are still checking localStorage for an existing session.
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Effect to check for a persisted token when the component mounts.
     * This prevents the user from being logged out on page refresh.
     */
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsLoggedIn(true);
        }
        setIsLoading(false);
    }, []);

    const login = (token: string) => {
        localStorage.setItem('authToken', token);
        setIsLoggedIn(true);
    }

    const logout = () => {
        localStorage.removeItem('authToken');
        setIsLoggedIn(false);
    }

    // Prevent the app from rendering until we verify the user's authentication status.
    if (isLoading) {
        return null; // or a loading spinner
    }

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Custom hook to consume the AuthContext.
 * Guaranteed to return the context data or throw an error if used incorrectly.
 * * @throws {Error} If used outside of an AuthProvider.
 * @returns {AuthContextType} The authentication context.
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};