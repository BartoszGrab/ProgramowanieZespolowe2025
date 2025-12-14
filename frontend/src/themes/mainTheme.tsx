import { createTheme } from '@mui/material/styles';

const mainTheme = createTheme({
   palette: {
    primary: {
      main: '#DD980A', // Gamboge - main orange
      light: '#E4C19C', // Crayola's Gold - lighter variant
      dark: '#BE6904', // Alloy Orange - darker variant
    },
    secondary: {
      main: '#84301B', // Kobe - main brownish orange
      light: '#A1887F', // Olive Drab Camouflage - lighter variant
      dark: '#432816', // Bistre - darker variant
    },
    background: {
      default: '#E4C19C', // Crayola's Gold - light background
      paper: 'rgba(255, 247, 238, 1)'
    },
    text: {
      primary: '#432816', // Bistre - dark brown for primary text
      secondary: '#84301B', // Kobe - brownish orange for secondary text
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      color: '#BE6904', // Alloy Orange - darker variant for headings
    },
  },
  
  components: {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 20, // rounded corners
      },
    },
  },
},

});

export default mainTheme;