import { createTheme } from '@mui/material/styles';

const mainTheme = createTheme({
   palette: {
    primary: {
      main: '#DD980A', // Gamboge - główny pomarańcz
      light: '#E4C19C', // Crayola's Gold - jaśniejszy wariant
      dark: '#BE6904', // Alloy Orange - ciemniejszy wariant
    },
    secondary: {
      main: '#84301B', // Kobe - główny brąz
      light: '#A1887F', // Olive Drab Camouflage - jaśniejszy brąz (z listy)
      dark: '#432816', // Bistre - ciemniejszy wariant
    },
    background: {
      default: '#E4C19C', // here gradient background can't be made - we have to put it directly into container
      paper: 'rgba(255, 247, 238, 1)'
    },
    text: {
      primary: '#432816', // Bistre - ciemny brąz dla głównego tekstu
      secondary: '#84301B', // Kobe - dla drugorzędnego tekstu
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      color: '#BE6904', // Alloy Orange - dla nagłówków (ciemny pomarańcz)
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