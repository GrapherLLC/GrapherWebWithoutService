/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E6E9F4',  // Lightest blue
          100: '#C5CCE6',
          200: '#9AA6D6',
          300: '#6B7FC7',
          400: '#4A5DB8',  // Base blue
          500: '#394A9F',
          600: '#2B3B86',
          700: '#1E2B6E',
          800: '#121C55',
          900: '#060C3C',  // Darkest blue
        },
        // Dark theme colors with neutral backgrounds and text
        dark: {
          bg: '#111111',      // Primary background (almost black)
          card: '#1A1A1A',    // Card background (slightly lighter)
          input: '#222222',   // Input background
          border: '#333333',  // Borders
          text: {
            primary: '#FFFFFF',   // Primary text (white)
            secondary: '#CCCCCC', // Secondary text (light gray)
            muted: '#999999',     // Muted text (medium gray)
          }
        }
      }
    },
  },
  plugins: [],
} 