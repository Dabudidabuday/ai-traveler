import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createTheme, ThemeProvider } from '@mui/material';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './index.css'
import App from './App.tsx';
import { APIProvider } from '@vis.gl/react-google-maps';

const theme = createTheme();
const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
    <ReactQueryDevtools />
      <ThemeProvider theme={theme}>
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <App />
        </APIProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
