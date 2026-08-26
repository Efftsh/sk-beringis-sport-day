import { Sun, Moon } from 'lucide-react'
import type { CSSProperties } from 'react'
import { useTheme } from '../hooks/use_theme'

interface ThemeToggleProps {
  variant?: 'pill' | 'icon' | 'compact'
  className?: string
  style?: CSSProperties
  showLabel?: boolean
}

export default function ThemeToggle({
  variant = 'pill',
  className = '',
  style = {},
  showLabel = false,
}: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme()

  if (variant === 'compact' || variant === 'icon') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`theme-toggle-btn ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          border: isDark
            ? '1px solid rgba(255, 255, 255, 0.15)'
            : '1px solid rgba(226, 240, 235, 0.4)',
          background: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.15)',
          color: isDark ? '#fbbf24' : '#ffffff',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          padding: 0,
          flexShrink: 0,
          backdropFilter: 'blur(4px)',
          ...style,
        }}
        title={isDark ? 'Tukar ke Mod Cerah (Light Mode)' : 'Tukar ke Mod Gelap (Dark Mode)'}
        aria-label={isDark ? 'Tukar ke Mod Cerah' : 'Tukar ke Mod Gelap'}
      >
        {isDark ? (
          <Sun size={18} className="theme-toggle-icon theme-icon-sun" />
        ) : (
          <Moon size={18} className="theme-toggle-icon theme-icon-moon" />
        )}
      </button>
    )
  }

  // Default 'pill' variant with slick slider / animated icon
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle-pill ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 10px',
        borderRadius: '9999px',
        border: isDark
          ? '1px solid rgba(255, 255, 255, 0.18)'
          : '1px solid rgba(255, 255, 255, 0.25)',
        background: isDark ? 'rgba(30, 41, 59, 0.75)' : 'rgba(255, 255, 255, 0.15)',
        color: '#ffffff',
        fontSize: '12px',
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backdropFilter: 'blur(6px)',
        userSelect: 'none',
        ...style,
      }}
      title={isDark ? 'Tukar ke Mod Cerah (Light Mode)' : 'Tukar ke Mod Gelap (Dark Mode)'}
      aria-label={isDark ? 'Tukar ke Mod Cerah' : 'Tukar ke Mod Gelap'}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: isDark ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255, 255, 255, 0.25)',
          color: isDark ? '#fbbf24' : '#ffffff',
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {isDark ? (
          <Sun size={13} className="theme-icon-sun" />
        ) : (
          <Moon size={13} className="theme-icon-moon" />
        )}
      </div>
      {(showLabel || true) && (
        <span style={{ fontSize: '11px', letterSpacing: '0.2px' }}>
          {isDark ? 'Mod Gelap' : 'Mod Cerah'}
        </span>
      )}
    </button>
  )
}
