import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        game: {
          bg: '#1a1a2e',
          bgGradient: '#16213e',
          platform: '#4cc9f0',
          platformSpecial: '#f72585',
          cube: '#ffbe0b',
          gem: '#00ff88',
        }
      },
    },
  },
  plugins: [],
} satisfies Config
