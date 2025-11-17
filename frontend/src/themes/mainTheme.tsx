import { createTheme } from '@mui/material/styles';

const mainTheme = createTheme({
  palette: {
    primary: {
      main: '#FFB74D', // primary palette orange
      light: '#FFCC80',
      dark: '#FB8C00',
    },
    secondary: {
      main: '#A1887F', // secondary palette brown
      light: '#D7CCC8',
      dark: '#8D6E63',
    },
    background: {
      default: '#FFF8E1', // background color
      paper: '#FFF3E0', // paper color
    },
    text: {
      primary: '#5D4037', // dark brown for primary text
      secondary: '#8D6E63',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      color: '#E65100', // dark orange for headings
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