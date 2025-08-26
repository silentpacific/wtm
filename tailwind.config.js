/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // New WhatTheMenu design system (primary)
        'wtm-primary': '#E75A2F',     // warm orange CTAs
        'wtm-primary-600': '#d44e26', // hover
        'wtm-secondary': '#2E7E6F',   // calming teal (trust)
        'wtm-bg': '#FFF8F3',          // warm paper tint sections
        'wtm-surface': '#FFFFFF',
        'wtm-text': '#1C1C1C',
        'wtm-muted': '#6B7280',

        // Chip colors (AA-compliant)
        'chip-gluten': { bg: '#FCEDEA', fg: '#7A2E21' },
        'chip-dairy': { bg: '#E9F6F3', fg: '#1A5A50' },
        'chip-nuts': { bg: '#FFF4D6', fg: '#7A5A07' },
        'chip-shell': { bg: '#EAF2FF', fg: '#1A3E73' },
        'chip-veg': { bg: '#EAF8E6', fg: '#235A1E' },
        'chip-spicy': { bg: '#FEE2E2', fg: '#7F1D1D' },

        // Professional B2B color palette (existing - keeping for backwards compatibility)
        coral: {
          50: '#fef7f2',
          100: '#feeee5',
          200: '#fcd9cc',
          300: '#f9bfa8',
          400: '#f59e7a',
          500: '#ef7f4f', // Main coral - professional but friendly
          600: '#e0653a', // Used for menu buttons and highlights
          700: '#bc4f2a',
          800: '#954025',
          900: '#783723',
        },
        charcoal: {
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#454545',
          900: '#3d3d3d',
          950: '#262626', // Deep professional charcoal
        },
        // Sophisticated secondary colors (existing)
        sage: {
          50: '#f6f6f6',
          100: '#e3e7e3',
          200: '#c7d0c7',
          300: '#a3b2a3',
          400: '#7a8f7a',
          500: '#5c725c',
          600: '#475a47',
          700: '#3a4a3a',
          800: '#2f3c2f',
          900: '#283228',
        },
        cream: {
          50: '#fdfdfb',
          100: '#faf9f5',
          200: '#f4f2ea',
          300: '#ebe7db',
          400: '#ddd7c7',
          500: '#cdc5af',
          600: '#b8ad93',
          700: '#a0927a',
          800: '#857767',
          900: '#6d6155',
        },
        // Restaurant menu specific colors
        menu: {
          // Dietary tag colors
          vegetarian: '#22c55e', // Green for vegetarian/vegan
          'vegetarian-light': '#dcfce7',
          'vegetarian-dark': '#16a34a',
          
          // Allergen warning colors  
          allergen: '#ef4444', // Red for allergen warnings
          'allergen-light': '#fee2e2',
          'allergen-dark': '#dc2626',
          
          // Server response colors
          'response-yes': '#10b981', // Green for "Yes"
          'response-no': '#ef4444',  // Red for "No" 
          'response-check': '#f59e0b', // Yellow for "Let me check"
          
          // Language selector colors
          'lang-active': '#e0653a', // Coral 600
          'lang-inactive': '#f3f4f6', // Light gray
          
          // Order list colors
          'order-bg': '#f9fafb', // Light background for order items
          'order-border': '#e5e7eb', // Border for order items
          'price-highlight': '#e0653a', // Coral for price emphasis
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        // New design system fonts
        heading: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.6rem' }], // Updated line height for better readability
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
        // Menu-specific font sizes for mobile readability
        'menu-dish': ['1.125rem', { lineHeight: '1.5rem' }], // 18px for dish names
        'menu-price': ['1.25rem', { lineHeight: '1.75rem' }], // 20px for prices
        'menu-description': ['0.875rem', { lineHeight: '1.375rem' }], // 14px for descriptions
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        // Touch-friendly spacing for mobile menu
        'touch': '2.75rem', // 44px minimum touch target
        'menu-section': '1.5rem', // 24px section spacing
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        // Menu-specific animations
        'order-expand': 'orderExpand 0.3s ease-out',
        'add-to-cart': 'addToCart 0.2s ease-out',
        'language-switch': 'languageSwitch 0.2s ease-in-out',
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
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        // Menu-specific keyframes
        orderExpand: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        addToCart: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        languageSwitch: {
          '0%': { opacity: '0.7' },
          '100%': { opacity: '1' },
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 20px -5px rgba(0, 0, 0, 0.04)',
        'strong': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        // Menu-specific shadows
        'order-bar': '0 -4px 25px -5px rgba(0, 0, 0, 0.1)',
        'menu-card': '0 2px 10px -2px rgba(0, 0, 0, 0.1)',
        'modal': '0 20px 60px -10px rgba(0, 0, 0, 0.3)',
      },
      // Screen height utilities for mobile menu
      height: {
        'menu-modal': '80vh', // 80% screen height for order list modal
        'order-bar': '4rem', // Fixed height for sticky order bar
      },
      minHeight: {
        'touch': '2.75rem', // 44px minimum touch target height
      },
      // Z-index utilities for menu layers
      zIndex: {
        'order-bar': '50',
        'menu-modal': '50',
        'language-bar': '40',
        'menu-header': '30',
      }
    },
  },
  plugins: [],
}