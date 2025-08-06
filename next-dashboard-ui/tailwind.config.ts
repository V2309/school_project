// import type { Config } from "tailwindcss";

// const config: Config = {
//   content: [
//     "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
//   ],
//   theme: {
//     extend: {
//       backgroundImage: {
//         "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
//         "gradient-conic":
//           "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
//       },
//        colors: {
   
//         lamaSky: "#C3EBFA",
//         lamaSkyLight: "#EDF9FD",
//         lamaPurple: "#CFCEFF",
//         lamaPurpleLight: "#F1F0FF",
//         lamaYellow: "#FAE27C",
//         lamaYellowLight: "#FEFCE8",
//         primary: {
//           DEFAULT: "#2563EB",
//           light: "#3B82F6",
//           dark: "#1D4ED8",
//         },
//         dark: {
//           DEFAULT: "#1E293B",
//           light: "#334155",
//           lighter: "#64748B",
//         },
//       },
//     },
//   },
//   plugins: [],
// };
// export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        // --- CÁC MÀU MỚI CHO GIAO DIỆN "CLASSFLOW" ---
        'primary': {
          DEFAULT: '#4F46E5', // A vibrant indigo
          'light': '#6366F1',
          'dark': '#4338CA',
        },
        'secondary': '#10B981', // A modern emerald/green
        'background': '#F9FAFB', // A very light gray for the page background
        'surface': '#FFFFFF', // White for cards, headers, etc.
        'copy': {
          'base': '#1F2937', // Dark gray for main text
          'light': '#6B7280', // Lighter gray for descriptions
        },
        // --- CÁC MÀU CŨ CỦA BẠN VẪN ĐƯỢC GIỮ LẠI ---
        lamaSky: "#C3EBFA",
        lamaSkyLight: "#EDF9FD",
        lamaPurple: "#CFCEFF",
        lamaPurpleLight: "#F1F0FF",
        lamaYellow: "#FAE27C",
        lamaYellowLight: "#FEFCE8",
      },
    },
  },
  plugins: [],
};
export default config;