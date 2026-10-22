/** @type {import('tailwindcss').Config} */
// Categorical palette = manifest.palette.groups: one hue per stage plus gate and lever (KICKOFF §4).
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Iowan Old Style"', '"Palatino Linotype"', 'Palatino', '"Book Antiqua"', 'Georgia', 'serif'],
        body: ['"Avenir Next"', 'Avenir', '"Segoe UI"', '"Gill Sans"', 'system-ui', 'sans-serif'],
        mono: ['"SF Mono"', 'Menlo', 'Consolas', 'monospace'],
      },
      colors: {
        ink: { DEFAULT: '#1f1b16', muted: '#5d5750' },
        paper: { DEFAULT: '#faf8f4', 2: '#f1ede6' },
        night: { DEFAULT: '#15130f', 2: '#211d18', ink: '#efeae2', muted: '#b3aca1' },
        cat: {
          plan: '#4a4a4a', attract: '#1f7a63', select: '#2a5aa6', offer: '#a85a1f', 'clear-start': '#7b2c5e', onboard: '#1f6f8b',
          develop: '#3b7a2a', retain: '#8a6d00', handover: '#6b4e9b', gate: '#8a6d00', lever: '#2a5aa6',
        },
      },
    },
  },
  plugins: [],
};
