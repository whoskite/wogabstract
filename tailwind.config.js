/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        'neon-pink': '#ff2a6d',
        'neon-blue': '#00a8ff',
        'neon-green': '#39ff14',
        'neon-purple': '#d300c5',
        'dark-bg': '#0a0a0f',
        'darker-bg': '#050507',
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        black: "#000000",
        white: "#ffffff",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "shine": "shine 3s infinite ease-in-out",
        "fade-in": "fadeIn 0.5s ease-in-out forwards",
        "grow": "grow 1.2s ease-out forwards",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "shine": {
          "0%": { transform: "translateX(-200%) skewX(-12deg)" },
          "100%": { transform: "translateX(400%) skewX(-12deg)" },
        },
        "fadeIn": {
          "from": { 
            opacity: "0", 
            transform: "translateY(-10px)" 
          },
          "to": { 
            opacity: "1", 
            transform: "translateY(0)" 
          },
        },
        "grow": {
          "0%": { 
            width: "10px", 
            height: "10px", 
            opacity: "0.8" 
          },
          "50%": { 
            opacity: "0.9"
          },
          "100%": { 
            width: "4000px", 
            height: "4000px", 
            opacity: "1" 
          }
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'cyberpunk-grid': 'linear-gradient(to right, rgba(5, 217, 232, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(5, 217, 232, 0.1) 1px, transparent 1px)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

