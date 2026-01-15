import { createTheme, alpha } from '@mui/material/styles'

// 🏥 Clean Clinical Palette
const palette = {
  mode: 'light' as const,
  primary: {
    main: '#0288d1', // Clinical Blue
    light: '#5eb8ff',
    dark: '#005b9f',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#2e7d32', // Success Green (for healthy lungs)
    light: '#60ad5e',
    dark: '#005005',
    contrastText: '#ffffff',
  },
  background: {
    default: '#f5f7fa', // Very light gray/blue tint
    paper: '#ffffff',
  },
  text: {
    primary: '#1e293b', // Slate 900
    secondary: '#64748b', // Slate 500
  },
  error: {
    main: '#d32f2f',
  },
  warning: {
    main: '#ed6c02',
  },
  info: {
    main: '#0288d1',
  },
}

export const lightTheme = createTheme({
  palette,
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', // Tailwind style subtle shadow
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          border: '1px solid #e2e8f0',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
        },
      },
    },
  },
})

// We default to light theme now
export const darkTheme = lightTheme