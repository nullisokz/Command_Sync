import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import MainPage from './pages/MainPage/index.tsx'
import NavBar from './components/NavBar/index.tsx'
import { ThemeProvider, CssBaseline } from '@mui/material';
import { appTheme } from './theme/theme.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <NavBar/>
      <MainPage />
    </ThemeProvider>
  </StrictMode>,
)
