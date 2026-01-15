import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode } from 'react'
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material'
import { lightTheme, darkTheme } from './index'

interface ThemeContextType {
  darkMode: boolean
  toggleDarkMode: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  darkMode: true,
  toggleDarkMode: () => {},
})

export const useThemeContext = () => useContext(ThemeContext)

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Default to dark mode for that professional radiologist look
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('lungscareai-dark-mode')
    return saved !== null ? JSON.parse(saved) : true // Default true for demo
  })

  useEffect(() => {
    localStorage.setItem('lungscareai-dark-mode', JSON.stringify(darkMode))
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode((prev: boolean) => !prev)
  }

  const theme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode])

  const contextValue = useMemo(
    () => ({
      darkMode,
      toggleDarkMode,
    }),
    [darkMode]
  )

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}

export default ThemeProvider

