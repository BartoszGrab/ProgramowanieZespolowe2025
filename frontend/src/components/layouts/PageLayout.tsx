import React from 'react';
import { Box } from '@mui/material';
import ColorModeSelect from '../../customs/ColorModeSelect';

// Background image import
import libBg from '../../saved/lib_bg.png'; 

/**
 * Properties for the {@link PageLayout} component.
 */
interface PageLayoutProps {
  /** The content to be rendered inside the layout container. */
  children: React.ReactNode;
  /**
   * Optional flag to show or hide the color mode toggle switch in the top-right corner.
   * @default true
   */
  showColorMode?: boolean;
}


/**
 * A main layout wrapper that provides a consistent structure and background for application pages.
 *
 * @remarks
 * This component handles the visual layering of the page background, which consists of:
 * 1. A static background image (`libBg`).
 * 2. A color overlay with a 'multiply' blend mode.
 * 3. A bottom gradient for visual depth.
 *
 * It also centers the content within a constrained max-width container and applies
 * necessary padding to prevent overlap with the fixed navigation bar.
 *
 * @param props - The configuration properties defined in {@link PageLayoutProps}.
 * @returns A JSX element representing the full page structure.
 */
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

      {/* --- ColorModeSwitch  --- */}
      {showColorMode && (
        <Box sx={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 50 }}>
          <ColorModeSelect />
        </Box>
      )}

      {/* --- Content --- */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pt-24"
      style={{ paddingTop: '145px' }}>
        {children}
      </div>
    </div>
  );
};