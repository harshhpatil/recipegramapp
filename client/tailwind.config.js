/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFCFB',
          100: '#F8F6F4',
          200: '#F3F1EE',
          300: '#EBE8E4',
        },
        warmGray: {
          50: '#F5F4F3',
          100: '#E8E6E4',
          200: '#D4D1CE',
          300: '#ADA9A5',
          400: '#8C8784',
          500: '#6B6562',
          600: '#5A5653',
          700: '#4A4543',
          800: '#3A3734',
          900: '#2A2725',
        },
        primary: {
          50: '#FDF5F3',
          100: '#FCE8E3',
          200: '#F9D1C7',
          300: '#F4B5A3',
          400: '#EE9980',
          500: '#E8825C',
          600: '#D66B43',
          700: '#B8562E',
          800: '#8F421F',
          900: '#6B3115',
        },
        secondary: {
          50: '#F5F7F4',
          100: '#E8ECE5',
          200: '#D4DCD0',
          300: '#B5C3AD',
          400: '#9CAF90',
          500: '#8B9A7E',
          600: '#748268',
          700: '#5D6B53',
          800: '#47523F',
          900: '#343D2E',
        },
        success: {
          500: '#7FB069',
          600: '#6A9556',
        },
        warning: {
          500: '#F4A261',
          600: '#E08746',
        },
        error: {
          500: '#D16666',
          600: '#B54848',
        },
        info: {
          500: '#7BAAB5',
          600: '#5F8A96',
        },
      },

      fontFamily: {
        // System font stack for maximum performance
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
        ],
        // Monospace for recipe data (timers, measurements)
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          '"SF Mono"',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ],
      },
      
      fontSize: {
        // Refined typography scale
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.02em' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.01em' }],
        'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        'xl': ['1.25rem', { lineHeight: '1.875rem', letterSpacing: '-0.01em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }],
        '4xl': ['2.25rem', { lineHeight: '2.75rem', letterSpacing: '-0.03em' }],
        '5xl': ['3rem', { lineHeight: '3.5rem', letterSpacing: '-0.03em' }],
      },
      
      spacing: {
        // Additional spacing for generous whitespace
        '18': '4.5rem',
        '88': '22rem',
        '104': '26rem',
        '128': '32rem',
      },
      
      boxShadow: {
        // Soft, warm shadows
        'soft-xs': '0 1px 2px 0 rgba(74, 69, 67, 0.04)',
        'soft-sm': '0 2px 4px -1px rgba(74, 69, 67, 0.06), 0 1px 2px -1px rgba(74, 69, 67, 0.04)',
        'soft': '0 4px 6px -1px rgba(74, 69, 67, 0.08), 0 2px 4px -1px rgba(74, 69, 67, 0.04)',
        'soft-md': '0 6px 12px -2px rgba(74, 69, 67, 0.10), 0 3px 6px -2px rgba(74, 69, 67, 0.05)',
        'soft-lg': '0 10px 20px -3px rgba(74, 69, 67, 0.12), 0 4px 8px -2px rgba(74, 69, 67, 0.06)',
        'soft-xl': '0 20px 25px -5px rgba(74, 69, 67, 0.14), 0 8px 12px -4px rgba(74, 69, 67, 0.08)',
        'glow': '0 0 20px rgba(232, 130, 92, 0.15)',
      },
      
      borderRadius: {
        // Consistent rounded corners
        'sm': '0.25rem',
        'DEFAULT': '0.5rem',
        'md': '0.625rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      
      animation: {
        // Micro-interactions
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
