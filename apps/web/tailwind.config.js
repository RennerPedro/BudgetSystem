/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        finance: {
          surface: {
            base: 'var(--surface-base)',
            raised: 'var(--surface-raised)',
            overlay: 'var(--surface-overlay)',
            sunken: 'var(--surface-sunken)',
          },
          accent: {
            primary: 'var(--accent-primary)',
            primaryMuted: 'var(--accent-primary-muted)',
            success: 'var(--accent-success)',
            danger: 'var(--accent-danger)',
            warning: 'var(--accent-warning)',
          },
          text: {
            primary: 'var(--text-primary)',
            secondary: 'var(--text-secondary)',
            tertiary: 'var(--text-tertiary)',
            inverse: 'var(--text-inverse)',
          },
          border: {
            subtle: 'var(--border-subtle)',
            default: 'var(--border-default)',
            strong: 'var(--border-strong)',
          },
        },
      },
    },
  },
  plugins: [],
}
