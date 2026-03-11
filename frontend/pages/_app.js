import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/router';
import '@/styles/globals.css';

const theme = createTheme({
  palette: {
    primary: { main: '#7c3aed', light: '#a78bfa', dark: '#5b21b6' },
    secondary: { main: '#f97316', light: '#fdba74', dark: '#ea580c' },
    success: { main: '#059669', light: '#6ee7b7', dark: '#047857' },
    error: { main: '#dc2626', light: '#fca5a5', dark: '#b91c1c' },
    warning: { main: '#d97706', light: '#fde68a', dark: '#b45309' },
    info: { main: '#0891b2', light: '#67e8f9', dark: '#0e7490' },
    background: { default: '#f0ebff', paper: '#ffffff' },
    text: { primary: '#1a0533', secondary: '#6b21a8' },
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
    h4: { fontWeight: 800 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 24px 0 rgba(124,58,237,0.08)',
          borderRadius: 16,
          border: '1px solid rgba(167,139,250,0.15)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 700,
          fontSize: '0.875rem',
          letterSpacing: 0.2,
        },
        contained: {
          boxShadow: 'none',
          background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(124,58,237,0.4)',
            background: 'linear-gradient(135deg, #6d28d9 0%, #9333ea 100%)',
          },
        },
        containedSuccess: {
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
            boxShadow: '0 6px 20px rgba(5,150,105,0.4)',
          },
        },
        containedError: {
          background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
          '&:hover': { background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)' },
        },
        outlined: {
          borderColor: 'rgba(124,58,237,0.3)',
          '&:hover': { borderColor: '#7c3aed', background: 'rgba(124,58,237,0.04)' },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            background: '#faf8ff',
            '&:hover fieldset': { borderColor: '#a78bfa' },
            '&.Mui-focused fieldset': { borderColor: '#7c3aed' },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: { root: { borderRadius: 10, background: '#faf8ff' } },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 8, fontWeight: 600 } },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            background: 'linear-gradient(135deg, #f5f0ff 0%, #ede9fe 100%)',
            fontWeight: 700,
            color: '#5b21b6',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: '#faf8ff' },
          '&:last-child td': { border: 0 },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          color: '#7c3aed',
          '&.Mui-selected': { color: '#5b21b6' },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { background: 'linear-gradient(90deg, #7c3aed, #a855f7)', height: 3, borderRadius: 2 },
      },
    },
    MuiAppBar: {
      styleOverrides: { root: { boxShadow: 'none' } },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 24px 0 rgba(124,58,237,0.08)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: { root: { borderRadius: 10 } },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 20 } },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 4, backgroundColor: 'rgba(167,139,250,0.15)' },
        bar: { borderRadius: 4 },
      },
    },
    MuiStepper: {
      styleOverrides: { root: { background: 'transparent' } },
    },
  },
});

const PUBLIC_ROUTES = ['/login', '/request-access'];

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isPublic = PUBLIC_ROUTES.includes(router.pathname);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        {!isPublic && <Navbar />}
        <Component {...pageProps} />
      </AuthProvider>
    </ThemeProvider>
  );
}
