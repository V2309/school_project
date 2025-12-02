
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ['class'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        hero: "url('/images/hero-background.png')",
      },
      colors: {
        textGray: "#71767b",
        textGrayLight: "#e7e9ea",
        borderGray: "#2f3336",
        inputGray: "#202327",
        iconBlue: "#1d9bf0",
        iconGreen: "#00ba7c",
        iconPink: "#f91880",
        // --- STREAM/MEETING COLORS ---
        dark: {
          1: '#1C1F2E',
          2: '#161925',
          3: '#252A41',
          4: '#1E2757',
        },
        blue: {
          1: '#0E78F9',
        },
        sky: {
          1: '#C9DDFF',
          2: '#ECF0FF',
          3: '#F5FCFF',
        },
        orange: {
          1: '#FF742E',
        },
        purple: {
          1: '#830EF9',
        },
        yellow: {
          1: '#F9A90E',
        },
        // --- CÁC MÀU CHO GIAO DIỆN "CLASSFLOW" ---
        'primary': {
          DEFAULT: '#1e88e5',
          'light': '#6366F1',
          'dark': '#4338CA',
        },
        'secondary': '#10B981',
        'background': '#F9FAFB',
        'surface': '#FFFFFF',
        'copy': {
          'base': '#1F2937',
          'light': '#6B7280',
        },
        // --- CÁC MÀU CŨ CỦA BẠN VẪN ĐƯỢC GIỮ LẠI ---
        lamaSky: "#C3EBFA",
        lamaSkyLight: "#EDF9FD",
        lamaPurple: "#CFCEFF",
        lamaPurpleLight: "#F1F0FF",
        lamaYellow: "#FAE27C",
        lamaYellowLight: "#FEFCE8",
        appbg: "#f0f2f5",
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;