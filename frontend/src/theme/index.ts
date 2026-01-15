import { createTheme, ThemeOptions } from '@mui/material/styles'

// Shared typography and shape settings
const sharedSettings: ThemeOptions = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none' as const, fontWeight: 500 },
  },
  shape: {
    borderRadius: 12,
  },
}

// Light Theme
export const lightTheme = createTheme({
  ...sharedSettings,
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#4db6ac', // Medical Teal
      light: '#80cbc4',
      dark: '#00897b',
      contrastText: '#ffffff',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a2027',
      secondary: '#5f6368',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
})

// 🌟 GLASSMORPHISM DARK MODE - Professional Radiologist Look
export const darkTheme = createTheme({
  ...sharedSettings,
  palette: {
    mode: 'dark',
    primary: {
      main: '#66b2ff', // Bright blue for dark backgrounds
      light: '#90caf9',
      dark: '#42a5f5',
      contrastText: '#0a1929',
    },
    secondary: {
      main: '#4db6ac', // Medical Teal - "Safe/Normal"
      light: '#80cbc4',
      dark: '#26a69a',
      contrastText: '#0a1929',
    },
    success: {
      main: '#66bb6a', // Brighter for dark mode
      light: '#81c784',
      dark: '#4caf50',
    },
    warning: {
      main: '#ffa726',
      light: '#ffb74d',
      dark: '#ff9800',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
    },
    background: {
      default: '#0a1929', // Deep medical blue/black
      paper: '#132f4c', // Slightly lighter for cards
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: '#4db6ac #132f4c',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: 8,
            height: 8,
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: '#4db6ac',
          },
          '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
            backgroundColor: '#132f4c',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(19, 47, 76, 0.8)', // Glassmorphism
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 16,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(19, 47, 76, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 12px 48px rgba(0, 0, 0, 0.4)',
            borderColor: 'rgba(77, 182, 172, 0.3)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 20px rgba(102, 178, 255, 0.3)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #66b2ff 0%, #42a5f5 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #90caf9 0%, #66b2ff 100%)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(10, 25, 41, 0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(19, 47, 76, 0.5)',
            '&:hover': {
              backgroundColor: 'rgba(19, 47, 76, 0.7)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(19, 47, 76, 0.7)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
        filled: {
          backgroundColor: 'rgba(77, 182, 172, 0.2)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        standardInfo: {
          backgroundColor: 'rgba(102, 178, 255, 0.15)',
        },
        standardSuccess: {
          backgroundColor: 'rgba(102, 187, 106, 0.15)',
        },
        standardWarning: {
          backgroundColor: 'rgba(255, 167, 38, 0.15)',
        },
        standardError: {
          backgroundColor: 'rgba(244, 67, 54, 0.15)',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#4db6ac',
          height: 3,
          borderRadius: '3px 3px 0 0',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: '#4db6ac',
          },
        },
      },
    },
  },
})

export default darkTheme

