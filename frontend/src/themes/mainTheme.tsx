import { createTheme } from '@mui/material/styles';

/**
 * Defines the custom Material UI theme configuration for the application.
 * This object overrides the default MUI styles to establish a cohesive brand identity,
 * focusing on a warm color palette (Oranges and Browns).
 */
const mainTheme = createTheme({
  palette: {
    // Defines the primary color suite, used for main actions (buttons) and highlights.
    primary: {
      main: '#DD980A', // Gamboge - main orange
      light: '#E4C19C', // Crayola's Gold - lighter variant
      dark: '#BE6904', // Alloy Orange - darker variant
    },
    // Defines the secondary color suite, used for accents and floating action buttons.
    secondary: {
      main: '#84301B', // Kobe - main brownish orange
      light: '#A1887F', // Olive Drab Camouflage - lighter variant
      dark: '#432816', // Bistre - darker variant
    },
    // Customizes the application background colors.
    background: {
      default: '#E4C19C', // Crayola's Gold - light background applied to the <body>
      paper: 'rgba(255, 247, 238, 1)' // Background for Card, Drawer, and Dialog components
    },
    // Overrides default text colors for better contrast against the warm background.
    text: {
      primary: '#432816', // Bistre - dark brown for primary text
      secondary: '#84301B', // Kobe - brownish orange for secondary text
    },
  },

  /**
   * Typography configuration.
   * Sets the global font family and overrides specific heading styles.
   */
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      color: '#BE6904', // Alloy Orange - darker variant for h4 headings
    },
  },
  
  /**
   * Component-level overrides.
   * This section modifies the default styles of specific MUI components globally.
   */
  components: {
    MuiButton: {
      styleOverrides: {
        // Applies a consistent rounded pill-shape to all buttons.
        root: {
          borderRadius: 20, 
        },
      },
    },
  },
});

export default mainTheme;