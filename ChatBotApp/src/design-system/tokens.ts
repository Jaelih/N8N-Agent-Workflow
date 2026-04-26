/**
 * PLDT Enterprise Design System
 * Production-ready design tokens for telecom UI
 */

export const designTokens = {
  // PLDT Brand Colors
  colors: {
    pldt: {
      red: '#D6001C',
      redDark: '#A00016',
      redDeep: '#7A0011',
      redLight: '#E6334D',
    },
    neutral: {
      charcoal: '#1A1A1A',
      gray900: '#2D2D2D',
      gray800: '#404040',
      gray700: '#525252',
      gray600: '#737373',
      gray500: '#8C8C8C',
      gray400: '#A6A6A6',
      gray300: '#BFBFBF',
      gray200: '#D9D9D9',
      gray100: '#EDEDED',
      gray50: '#F5F6F8',
      white: '#FFFFFF',
    },
    semantic: {
      success: '#00A651',
      warning: '#FF9500',
      error: '#D6001C',
      info: '#0066CC',
    },
    alpha: {
      redLight: 'rgba(214, 0, 28, 0.08)',
      redMedium: 'rgba(214, 0, 28, 0.16)',
      redStrong: 'rgba(214, 0, 28, 0.24)',
      blackLight: 'rgba(26, 26, 26, 0.04)',
      blackMedium: 'rgba(26, 26, 26, 0.08)',
      blackStrong: 'rgba(26, 26, 26, 0.12)',
    }
  },

  // Gradients
  gradients: {
    radialPrimary: 'radial-gradient(circle, #D6001C 0%, #A00016 50%, #7A0011 100%)',
    radialSubtle: 'radial-gradient(circle, rgba(214, 0, 28, 0.12) 0%, rgba(214, 0, 28, 0.04) 70%, transparent 100%)',
    radialGlow: 'radial-gradient(circle, rgba(214, 0, 28, 0.4) 0%, rgba(214, 0, 28, 0.2) 30%, transparent 60%)',
    linearActive: 'linear-gradient(135deg, #D6001C 0%, #A00016 100%)',
    linearHover: 'linear-gradient(135deg, #E6334D 0%, #D6001C 100%)',
  },

  // Spacing (8px base)
  spacing: {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
    32: '128px',
  },

  // Border Radius
  radius: {
    none: '0px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    full: '9999px',
  },

  // Shadows (enterprise-grade, subtle)
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(26, 26, 26, 0.04)',
    base: '0 2px 4px -1px rgba(26, 26, 26, 0.06), 0 1px 2px -1px rgba(26, 26, 26, 0.04)',
    md: '0 4px 6px -2px rgba(26, 26, 26, 0.08), 0 2px 4px -2px rgba(26, 26, 26, 0.04)',
    lg: '0 8px 12px -4px rgba(26, 26, 26, 0.10), 0 4px 6px -2px rgba(26, 26, 26, 0.04)',
    xl: '0 16px 24px -8px rgba(26, 26, 26, 0.12), 0 8px 12px -4px rgba(26, 26, 26, 0.04)',
    inner: 'inset 0 2px 4px 0 rgba(26, 26, 26, 0.06)',
    glow: '0 0 24px rgba(214, 0, 28, 0.24), 0 0 48px rgba(214, 0, 28, 0.12)',
    glowActive: '0 0 32px rgba(214, 0, 28, 0.32), 0 0 64px rgba(214, 0, 28, 0.16)',
  },

  // Typography
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
    },
    fontSize: {
      xs: ['12px', { lineHeight: '16px', letterSpacing: '0.01em' }],
      sm: ['14px', { lineHeight: '20px', letterSpacing: '0.005em' }],
      base: ['16px', { lineHeight: '24px', letterSpacing: 'normal' }],
      lg: ['18px', { lineHeight: '28px', letterSpacing: '-0.005em' }],
      xl: ['20px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
      '2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.015em' }],
      '3xl': ['30px', { lineHeight: '36px', letterSpacing: '-0.02em' }],
      '4xl': ['36px', { lineHeight: '40px', letterSpacing: '-0.025em' }],
      '5xl': ['48px', { lineHeight: '52px', letterSpacing: '-0.03em' }],
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },

  // Animation durations
  animation: {
    duration: {
      instant: '100ms',
      fast: '200ms',
      normal: '300ms',
      slow: '500ms',
      slower: '800ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      smooth: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  },

  // Z-index layers
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    overlay: 1200,
    modal: 1300,
    popover: 1400,
    tooltip: 1500,
  },
} as const;

export type DesignTokens = typeof designTokens;
