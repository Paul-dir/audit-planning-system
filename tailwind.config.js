/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* ===== MODERN ENTERPRISE COLOR SYSTEM ===== */
        
        /* Neutral Colors */
        'neutral': {
          '50': '#F8FAFC',   // Main background
          '100': '#F1F5F9',
          '200': '#E2E8F0',  // Borders
          '300': '#CBD5E1',
          '400': '#94A3B8',
          '500': '#64748B',
          '600': '#475569',
          '700': '#334155',
          '800': '#1E293B',
          '900': '#0F172A',  // Sidebar
          '950': '#020617',
        },

        /* Brand Blue - Primary */
        'primary': {
          '50': '#EFF6FF',
          '100': '#DBEAFE',
          '200': '#BFDBFE',
          '400': '#60A5FA',
          '500': '#3B82F6', // Primary color (#2563EB in requirements, using standard blue-500)
          '600': '#2563EB', // Primary hover
          '700': '#1D4ED8',
          '900': '#1E3A8A',
        },

        /* Success - Emerald */
        'success': {
          '50': '#F0FDF4',
          '100': '#DCFCE7',
          '200': '#BBF7D0',
          '500': '#10B981', // Main success
          '600': '#059669',
          '700': '#047857',
        },

        /* Warning - Amber */
        'warning': {
          '50': '#FFFBEB',
          '100': '#FEF3C7',
          '200': '#FCD34D',
          '500': '#F59E0B', // Main warning
          '600': '#D97706',
          '700': '#B45309',
        },

        /* Danger - Red */
        'danger': {
          '50': '#FEF2F2',
          '100': '#FEE2E2',
          '200': '#FECACA',
          '500': '#EF4444', // Main danger
          '600': '#DC2626',
          '700': '#B91C1C',
        },

        /* Info - Blue */
        'info': {
          '50': '#EFF6FF',
          '500': '#3B82F6',
          '600': '#2563EB',
        },

        /* Gold - Approvals & Highlights */
        'gold': {
          '50': '#FFFBEB',
          '100': '#FEF3C7',
          '200': '#FCD34D',
          '400': '#FBBF24',
          '500': '#D4A017', // Main gold for approvals
          '600': '#B8860B',
          '700': '#92400E',
        },

        /* Dashboard dark theme tokens */
        'bg': '#F8FAFC',
        'bg-dark': '#0d131a',
        'card-dark': '#161f28',
        'sidebar-dark': '#0a0f14',
        'panel-dark': '#161f28',
        'border-dark': '#1e293b',

        /* Legacy colors for backward compatibility */
        ink: '#0F172A',
        panel: '#161f28',
        'panel-light': '#1e293b',
        border: '#334155',
        'border-dark-token': '#1e293b',
        'text-hi': '#F8FAFC',
        'text-hi-dark': '#F8FAFC',
        'text-mid': '#94A3B8',
        'text-mid-dark': '#64748B',
        teal: '#10B981',
        coral: '#EF4444',
        blue: '#3B82F6',

        /* CSS variable references for theme system */
        card: 'var(--card)',
        background: 'var(--background)',
        sidebar: 'var(--sidebar)',
        surface: 'var(--surface)',
        divider: 'var(--border)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui, -apple-system, sans-serif'],
        serif: ['Fraunces', 'Georgia, serif'],
        mono: ['Menlo', 'Monaco', 'monospace'],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '1.4', letterSpacing: '0.3px' }],
        sm: ['13px', { lineHeight: '1.5', letterSpacing: '0.2px' }],
        base: ['14px', { lineHeight: '1.6' }],
        lg: ['15px', { lineHeight: '1.65' }],
        xl: ['16px', { lineHeight: '1.75' }],
        '2xl': ['18px', { lineHeight: '1.3', fontWeight: '600' }],
        '3xl': ['24px', { lineHeight: '1.2', fontWeight: '600' }],
        '4xl': ['32px', { lineHeight: '1.15', fontWeight: '700' }],
        '5xl': ['40px', { lineHeight: '1', fontWeight: '700' }],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
        '3xl': '48px',
        '4xl': '64px',
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        full: '9999px',
        DEFAULT: '8px',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        none: 'none',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-in-out',
        'slide-up': 'slide-up 200ms ease-in-out',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin': 'spin 1s linear infinite',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
      },
    },
  },
  plugins: [],
}
