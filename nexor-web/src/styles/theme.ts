export const theme = {
  colors: {
    primary: 'rgba(103, 58, 183, 1)', // Purple
    secondary: 'rgba(33, 150, 243, 1)', // Blue
    success: 'rgba(76, 175, 80, 1)', // Green
    error: 'rgba(244, 67, 54, 1)', // Red
    warning: 'rgba(255, 152, 0, 1)', // Orange
    info: 'rgba(33, 150, 243, 1)', // Blue
    background: {
      light: 'rgba(255, 255, 255, 0.7)',
      dark: 'rgba(18, 18, 18, 0.8)'
    },
    text: {
      light: 'rgba(0, 0, 0, 0.87)',
      dark: 'rgba(255, 255, 255, 0.87)'
    },
    glass: {
      light: 'rgba(255, 255, 255, 0.5)',
      dark: 'rgba(18, 18, 18, 0.5)',
      border: 'rgba(255, 255, 255, 0.2)'
    }
  },
  shadows: {
    small: '0 2px 8px rgba(0, 0, 0, 0.15)',
    medium: '0 4px 16px rgba(0, 0, 0, 0.15)',
    large: '0 8px 24px rgba(0, 0, 0, 0.15)'
  },
  blur: {
    light: '10px',
    medium: '15px',
    heavy: '20px'
  },
  borderRadius: {
    small: '8px',
    medium: '12px',
    large: '20px',
    pill: '9999px'
  },
  typography: {
    fontFamily: {
      sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      mono: '"JetBrains Mono", SFMono-Regular, Menlo, Monaco, Consolas, monospace'
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem'
  },
  transitions: {
    fast: '0.15s ease',
    medium: '0.3s ease',
    slow: '0.5s ease'
  },
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  // Liquid glass specific styles
  glass: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(15px)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)'
  }
};
