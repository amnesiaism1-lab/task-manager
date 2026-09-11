/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#090d16',
          subtle: '#0f172a',
          elevated: '#1e293b',
          surface: '#151e2e',
        },
        surface: {
          DEFAULT: '#0f172a',
          card: '#1e293b',
          elevated: '#243247',
          hover: '#2a3b54',
          border: '#283548',
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        status: {
          todo: '#64748b',
          progress: '#3b82f6',
          review: '#f59e0b',
          done: '#10b981',
          blocked: '#ef4444',
          warning: '#f59e0b',
          success: '#10b981',
          danger: '#ef4444',
        },
        text: {
          primary: '#f8fafc',
          secondary: '#94a3b8',
          muted: '#64748b',
        },
        border: {
          DEFAULT: '#283548',
          default: '#283548',
          subtle: 'rgba(255, 255, 255, 0.07)',
          focus: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        glow: '0 0 20px -2px rgba(59, 130, 246, 0.3)',
        card: '0 2px 10px -1px rgba(0, 0, 0, 0.5), 0 1px 4px -1px rgba(0, 0, 0, 0.3)',
        modal: '0 20px 50px -10px rgba(0, 0, 0, 0.7)',
      },
      borderRadius: {
        xl: '16px',
        '2xl': '20px',
      },
    },
  },
  plugins: [],
}
