// MUI imports
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import mainTheme from './themes/mainTheme';
import { Navigation } from './customs/Navigation';

import Home from './components/Home';
import Register from './components/Register'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Shelves from './components/Shelves'
import Profile from './components/Profile'
import Recommendations from './components/Recommendations'
import Community from './components/Community'


/**
 * The main App component that sets up the application structure.
 * Provides theme, routing, and navigation for the entire application.
 */
function App() {
  return (
    <ThemeProvider theme={mainTheme}>
      <CssBaseline />
      <BrowserRouter>
      {/* --- Navigation Component --- */}
        <Navigation />
        {/* --- Application Routes --- */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/shelves/:id" element={<Shelves />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-profile" element={<Profile />} />
          <Route path="/user/:id" element={<Profile />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/community" element={<Community />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );

}

export default App;
