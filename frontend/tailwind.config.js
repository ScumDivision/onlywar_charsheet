/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Only War — Imperial Guard dataslate
        'imperial-dark': '#0f1a15',
        'imperial-green': '#1a2f23',
        'phosphor-green': '#48bb78',
        'phosphor-dim': '#2f855a',
        'tarnished-gold': '#c5a059',
        'mechanicus-red': '#8b0000',
        'void-black': '#050505',

        // Rogue Trader — von Moehrder dynasty heraldry
        'dynasty-bg': '#0a0a0e',
        'dynasty-bg-elev': '#141220',
        'dynasty-blue': '#1e4458',
        'dynasty-blue-deep': '#0e2937',
        'dynasty-orange': '#c9591e',
        'dynasty-orange-bright': '#e87432',
        'dynasty-gold': '#b8945a',
        'dynasty-gold-bright': '#d4b57a',
        'dynasty-cream': '#e8c98a',
        'dynasty-ruby': '#9b1c2a',
      },
      fontFamily: {
        'mono': ['"Share Tech Mono"', 'monospace'],
        'gothic': ['"Cinzel"', 'serif'],
      },
      backgroundImage: {
        'scanlines': "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))",
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glitch': 'glitch 1s linear infinite',
      },
      keyframes: {
        glitch: {
          '2%, 64%': { transform: 'translate(2px,0) skew(0deg)' },
          '4%, 60%': { transform: 'translate(-2px,0) skew(0deg)' },
          '62%': { transform: 'translate(0,0) skew(5deg)' },
        }
      }
    },
  },
  plugins: [],
}
