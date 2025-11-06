import { createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#212328', paper: '#1c1e22' },
    primary:   { main: '#ffb75a' },
    text:      { primary: '#ffffff', secondary: '#e2e8f0' },
  },
});