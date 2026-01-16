import React from 'react';
import { Box } from '@mui/material';
import ColorModeSelect from '../../customs/ColorModeSelect';

// Background image import
import libBg from '../../saved/lib_bg.png'; 

interface PageLayoutProps {
  children: React.ReactNode;
  showColorMode?: boolean;
}

export const PageLayout = ({ children, showColorMode = true }: PageLayoutProps) => {
  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-background-paper transition-colors duration-300">
      
      {/* --- BACKGROUND --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        
        {/* LAYER 1: Background image */}
        <div 
            className="absolute inset-0 bg-cover bg-center bg-fixed opacity-90"
            style={{ backgroundImage: `url(${libBg})` }}
        />
        
        {/* LAYER 2: Colouring */}
        <div className="absolute inset-0 bg-primary-dark/40 mix-blend-multiply backdrop-blur-[2px]" />

        {/* LAYER 3: Bottom gradient overlay */}        
        <div className="absolute inset-0 bg-linear-to-t from-background-paper/70 via-transparent to-background-paper/5 via-15%" />
      </div>

      {/* --- ColorModeSwitch (TO - DO) --- */}
      {showColorMode && (
        <Box sx={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 50 }}>
          <ColorModeSelect />
        </Box>
      )}

      {/* --- Content --- */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pt-24"
      // fixed navbar padding
      style={{ paddingTop: '145px' }}>
        {children}
      </div>
    </div>
  );
};