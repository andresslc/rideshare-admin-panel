import React, { createContext, useContext, useEffect, useState } from 'react'
import { THEME_OPTIONS, COLOR_CONFIG } from '../config/constants'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Helper function to convert hex to RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

// Generate color palette from base color
const generateColorPalette = (baseColor) => {
  const rgb = hexToRgb(baseColor)
  if (!rgb) return {}

  // Generate different shades (simplified version)
  return {
    50: `${Math.min(255, rgb.r + 40)} ${Math.min(255, rgb.g + 40)} ${Math.min(255, rgb.b + 40)}`,
    100: `${Math.min(255, rgb.r + 30)} ${Math.min(255, rgb.g + 30)} ${Math.min(255, rgb.b + 30)}`,
    200: `${Math.min(255, rgb.r + 20)} ${Math.min(255, rgb.g + 20)} ${Math.min(255, rgb.b + 20)}`,
    300: `${Math.min(255, rgb.r + 10)} ${Math.min(255, rgb.g + 10)} ${Math.min(255, rgb.b + 10)}`,
    400: `${rgb.r} ${rgb.g} ${rgb.b}`,
    500: `${rgb.r} ${rgb.g} ${rgb.b}`, // Base color
    600: `${Math.max(0, rgb.r - 20)} ${Math.max(0, rgb.g - 20)} ${Math.max(0, rgb.b - 20)}`,
    700: `${Math.max(0, rgb.r - 40)} ${Math.max(0, rgb.g - 40)} ${Math.max(0, rgb.b - 40)}`,
    800: `${Math.max(0, rgb.r - 60)} ${Math.max(0, rgb.g - 60)} ${Math.max(0, rgb.b - 60)}`,
    900: `${Math.max(0, rgb.r - 80)} ${Math.max(0, rgb.g - 80)} ${Math.max(0, rgb.b - 80)}`,
    950: `${Math.max(0, rgb.r - 100)} ${Math.max(0, rgb.g - 100)} ${Math.max(0, rgb.b - 100)}`,
  }
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // If theme is forced, use that
    if (THEME_OPTIONS.forceTheme) {
      return THEME_OPTIONS.forceTheme
    }
    
    // Check localStorage if persistence is enabled
    if (THEME_OPTIONS.persistTheme) {
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) {
        return savedTheme
      }
    }
    
    // Check system preference if enabled
    if (THEME_OPTIONS.respectSystemTheme) {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      return systemPrefersDark ? 'dark' : 'light'
    }
    
    // Fall back to default theme
    return THEME_OPTIONS.defaultTheme
  })

  // Apply theme and colors to document
  useEffect(() => {
    const root = document.documentElement
    
    // Apply theme class
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }
    
    // Apply dynamic colors
    const primaryPalette = generateColorPalette(COLOR_CONFIG.primary.hex)
    const secondaryPalette = generateColorPalette(COLOR_CONFIG.secondary.hex)
    
    // Set CSS custom properties for primary colors
    Object.entries(primaryPalette).forEach(([shade, rgb]) => {
      root.style.setProperty(`--color-primary-${shade}`, rgb)
    })
    
    // Set CSS custom properties for secondary colors if enabled
    if (THEME_OPTIONS.enableSecondaryColor) {
      Object.entries(secondaryPalette).forEach(([shade, rgb]) => {
        root.style.setProperty(`--color-secondary-${shade}`, rgb)
      })
    }
    
    // Save theme preference if persistence is enabled
    if (THEME_OPTIONS.persistTheme && !THEME_OPTIONS.forceTheme) {
      localStorage.setItem('theme', theme)
    }
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    if (!THEME_OPTIONS.respectSystemTheme || THEME_OPTIONS.forceTheme) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e) => {
      // Only update if user hasn't manually set a theme
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleTheme = () => {
    // Only allow theme toggle if not forced and toggle is enabled
    if (!THEME_OPTIONS.forceTheme && THEME_OPTIONS.enableThemeToggle) {
      setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
    }
  }

  const setSpecificTheme = (newTheme) => {
    if (!THEME_OPTIONS.forceTheme && ['light', 'dark'].includes(newTheme)) {
      setTheme(newTheme)
    }
  }

  const value = {
    theme,
    setTheme: setSpecificTheme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    canToggleTheme: THEME_OPTIONS.enableThemeToggle && !THEME_OPTIONS.forceTheme,
    themeOptions: THEME_OPTIONS,
    colors: {
      primary: COLOR_CONFIG.primary,
      secondary: COLOR_CONFIG.secondary,
      hasSecondary: THEME_OPTIONS.enableSecondaryColor
    }
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
