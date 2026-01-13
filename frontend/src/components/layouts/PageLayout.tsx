import React from 'react';
import { Box } from '@mui/material';
import ColorModeSelect from '../../customs/ColorModeSelect';

// 1. IMPORTUJEMY OBRAZEK JAKO ZMIENNĄ
// Ścieżka "../../saved/" wychodzi z folderu layouts -> components -> src -> saved
import libBg from '../../saved/lib_bg.png'; 

interface PageLayoutProps {
  children: React.ReactNode;
  showColorMode?: boolean;
}

export const PageLayout = ({ children, showColorMode = true }: PageLayoutProps) => {
  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-background-paper transition-colors duration-300">
      
      {/* --- TŁO --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        
        {/* WARSTWA 1: Obrazek z importu */}
        {/* Używamy stylu inline dla backgroundImage, bo to jedyny pewny sposób przy imporcie z src */}
        <div 
            className="absolute inset-0 bg-cover bg-center bg-fixed opacity-90"
            style={{ backgroundImage: `url(${libBg})` }}
        />
        
        {/* WARSTWA 2: Przyciemnienie/Kolorowanie */}
        {/* Mieszamy Twój kolor primary-light z obrazkiem, żeby tekst był czytelny */}
        <div className="absolute inset-0 bg-primary-dark/40 mix-blend-multiply backdrop-blur-[2px]" />
        
        {/* Opcjonalnie: Dodatkowy gradient od dołu, żeby stopka nie zlewała się z tłem */}
        <div className="absolute inset-0 bg-gradient-to-t from-background-paper/70 via-transparent to-background-paper/5 via-15%" />
      </div>

      {/* --- PRZEŁĄCZNIK MOTYWU --- */}
      {showColorMode && (
        <Box sx={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 50 }}>
          <ColorModeSelect />
        </Box>
      )}

      {/* --- TREŚĆ --- */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {children}
      </div>
    </div>
  );
};