// src/main.tsx (Updated for MUI)

import { BrowserRouter } from 'react-router-dom';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'; 
// --- End MUI Imports ---
import App from './App.tsx';
import { AuthProvider } from "./contexts/AuthContext";
import './index.css'

// 1. Create a basic MUI theme (can be customized later)
const theme = createTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      {/* 2. MUI Theme Provider */}
      <ThemeProvider theme={theme}>
        <CssBaseline /> {/* Optional: Renders normal CSS baseline */}
        {/* 3. AuthProvider for User State/Security */}
        <AuthProvider>
            <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);