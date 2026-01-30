// MUI imports
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import mainTheme from './themes/mainTheme';
import { Navigation } from './customs/Navigation';

// Component imports
import Home from './components/Home';
import Register from './components/Register'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Shelves from './components/Shelves'
import Profile from './components/Profile'
import Recommendations from './components/Recommendations'
import Community from './components/Community'
import { AuthProvider } from './context/AuthContext';


/**
 * The main App component that sets up the application structure.
 * Provides theme, routing, and navigation for the entire application.
 */
function App() {
  return (
    // Inject the custom theme (colors, typography) into the component tree.
    <ThemeProvider theme={mainTheme}>
      {/* Normalize CSS across browsers and apply the theme's background color. */}
      <CssBaseline />
      
      {/* Provide global authentication state (user, login/logout functions) to all child components. */}
      <AuthProvider>
        <BrowserRouter>
        
        {/* --- Navigation Component --- */}
        {/* Rendered outside of Routes so it remains visible on every page. */}
          <Navigation />
          
          {/* <Box sx={{ height: 'calc(64px + 2rem)' }} /> */}
          
          {/* --- Application Routes --- */}
          {/* Defines the mapping between URL paths and the components to render. */}
          <Routes>
            {/* Public landing and authentication pages */}
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected/User specific pages */}
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Dynamic route: ':id' captures the specific shelf ID from the URL */}
            <Route path="/shelves/:id" element={<Shelves />} />
            
            {/* Profile Routes: Multiple paths mapping to the same component 
                to handle "My Profile" vs "Viewing another user" scenarios. */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-profile" element={<Profile />} />
            <Route path="/user/:id" element={<Profile />} />
            
            {/* Feature pages */}
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/community" element={<Community />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;