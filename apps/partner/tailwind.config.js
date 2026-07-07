/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"adineue PRO"', 'sans-serif'],
        heading: ['"adineue PRO"', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: '#fef7f0',
          100: '#fdeee0',
          200: '#fbd4b4',
          300: '#f8ba88',
          400: '#f4a05c',
          500: '#cf956d',
          600: '#b8845f',
          700: '#a17351',
          800: '#8a6243',
          900: '#735135',
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          50: '#f0f7f6',
          100: '#e0efed',
          200: '#c2dfdb',
          300: '#a3cfc9',
          400: '#84bfb7',
          500: '#578f82',
          600: '#4e8075',
          700: '#457168',
          800: '#3c625b',
          900: '#33534e',
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
          50: '#fffaf3',
          100: '#fef5e7',
          200: '#fdebd0',
          300: '#fce1b8',
          400: '#fbd7a1',
          500: '#fffaf3',
          600: '#f5f0e3',
          700: '#ebe6d3',
          800: '#e1dcc3',
          900: '#d7d2b3',
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        kuddl: {
          orange: '#cf956d',
          green: '#578f82',
          cream: '#fffaf3',
        },
        brand: {
          orange: '#cf956d',
          green: '#578f82',
          cream: '#fffaf3',
        },
        gray: {
          50: '#fffaf3',
          100: '#f8f5f0',
          200: '#f0ebe6',
          300: '#e8e1dc',
          400: '#d0c7c2',
          500: '#b8ada8',
          600: '#9c918c',
          700: '#807570',
          800: '#645954',
          900: '#483d38',
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 1s ease-out forwards',
        'pulse-slow': 'pulse-slow 2s ease-in-out infinite',
        'gradient': 'gradient 8s ease infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        fadeInUp: {
          'from': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'pulse-slow': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        gradient: {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
      },
      backgroundSize: {
        '200%': '200% 200%',
      },
    },
  },
  plugins: [],
}
