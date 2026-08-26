import { useState, useEffect, useCallback } from 'react'

export type Theme = 'light' | 'dark'

const THEME_KEY = 'sk_beringis_theme'

export function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'

  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'dark') {
      return saved
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
  } catch {
    // Ignore localStorage access issues
  }

  return 'light'
}

export function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
    root.setAttribute('data-theme', 'dark')
  } else {
    root.classList.remove('dark')
    root.setAttribute('data-theme', 'light')
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    // Apply currently active theme on mount
    applyTheme(theme)

    const handleThemeChange = (e: CustomEvent<Theme>) => {
      if (e.detail && (e.detail === 'light' || e.detail === 'dark')) {
        setThemeState(e.detail)
        applyTheme(e.detail)
      }
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === THEME_KEY && (e.newValue === 'light' || e.newValue === 'dark')) {
        setThemeState(e.newValue)
        applyTheme(e.newValue)
      }
    }

    window.addEventListener('theme-change' as any, handleThemeChange)
    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('theme-change' as any, handleThemeChange)
      window.removeEventListener('storage', handleStorage)
    }
  }, [theme])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    try {
      localStorage.setItem(THEME_KEY, newTheme)
    } catch {}
    applyTheme(newTheme)
    window.dispatchEvent(new CustomEvent('theme-change', { detail: newTheme }))
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  return {
    theme,
    isDark: theme === 'dark',
    setTheme,
    toggleTheme,
  }
}
