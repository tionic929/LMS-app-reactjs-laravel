// src/main.tsx (Updated for MUI)

import { BrowserRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'; 
// --- End MUI Imports ---
import App from './App.tsx';
import { AuthProvider } from "./contexts/AuthContext";
import './index.css'

// 1. Create a basic MUI theme (can be customized later)
const theme = createTheme();

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
            <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
);