import type { Config } from 'tailwindcss';
import { brandColors } from './tailwind.config.snippet';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: brandColors,
    },
  },
  plugins: [],
} satisfies Config;
