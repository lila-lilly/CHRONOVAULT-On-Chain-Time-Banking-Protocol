/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#080C14',
        deep:     '#0E1420',
        vault:    '#141D2E',
        clock:    '#1C2840',
        gold:     '#D4A843',
        'gold-lt':'#F0C96A',
        blue:     '#3B82F6',
        'blue-lt':'#60A5FA',
        cyan:     '#22D3EE',
        silver:   '#CBD5E1',
        muted:    '#4A5A78',
        faint:    '#1E2A40',
        ruby:     '#DC2626',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"Inter"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
        clock:   ['"Space Mono"', 'monospace'],
      },
      animation: {
        'tick':       'tick 1s steps(1) infinite',
        'rotate-slow':'rotate-slow 60s linear infinite',
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
        'count-up':   'count-up 0.4s ease-out',
      },
      keyframes: {
        tick: {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0' },
        },
        'rotate-slow': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        'pulse-gold': {
          '0%,100%': { boxShadow: '0 0 8px rgba(212,168,67,0.3)' },
          '50%':     { boxShadow: '0 0 24px rgba(212,168,67,0.6)' },
        },
      },
      backgroundImage: {
        'clock-grid': `
          linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)
        `,
        'gold-glow':  'radial-gradient(ellipse at 50% 0%, rgba(212,168,67,0.1) 0%, transparent 60%)',
        'blue-glow':  'radial-gradient(ellipse at 20% 80%, rgba(59,130,246,0.08) 0%, transparent 50%)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%)',
      },
    },
  },
  plugins: [],
}
