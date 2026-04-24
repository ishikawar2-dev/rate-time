import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans JP', 'system-ui', 'sans-serif'],
      },
      colors: {
        // テーマ切替対象の rt-* トークン（src/app/globals.css の CSS 変数を参照）
        'rt-bg': 'var(--bg-base)',
        'rt-card': 'var(--bg-card)',
        'rt-elevated': 'var(--bg-elevated)',
        'rt-border': 'var(--border-default)',
        'rt-border-strong': 'var(--border-strong)',
        'rt-text-primary': 'var(--text-primary)',
        'rt-text-secondary': 'var(--text-secondary)',
        'rt-text-tertiary': 'var(--text-tertiary)',
        'rt-text-muted': 'var(--text-muted)',
        'rt-accent-bg': 'var(--accent-bg)',
        'rt-accent-border': 'var(--accent-border)',
        'rt-accent-text': 'var(--accent-text)',
        'rt-accent-cta': 'var(--accent-cta)',
        'rt-accent-cta-hover': 'var(--accent-cta-hover)',
        'rt-success-bg': 'var(--success-bg)',
        'rt-success-border': 'var(--success-border)',
        'rt-success-text': 'var(--success-text)',
        'rt-success-cta': 'var(--success-cta)',
        'rt-success-cta-hover': 'var(--success-cta-hover)',
        'rt-bg-subtle': 'var(--bg-subtle)',
        // 元本（principal）= ネイビーブルー
        'rt-principal-bg': 'var(--principal-bg)',
        'rt-principal-border': 'var(--principal-border)',
        'rt-principal-text': 'var(--principal-text)',
        'rt-principal-cta': 'var(--principal-cta)',
        'rt-principal-cta-hover': 'var(--principal-cta-hover)',
        // 利息（interest）= 深アンバー
        'rt-interest-bg': 'var(--interest-bg)',
        'rt-interest-border': 'var(--interest-border)',
        'rt-interest-text': 'var(--interest-text)',
        'rt-interest-cta': 'var(--interest-cta)',
        'rt-interest-cta-hover': 'var(--interest-cta-hover)',
      },
      animation: {
        'count-up': 'count-up 0.3s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'pulse-red': 'pulse-red 2s infinite',
      },
      keyframes: {
        'count-up': {
          '0%': { transform: 'translateY(4px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'pulse-red': {
          '0%, 100%': { color: '#dc2626' },
          '50%': { color: '#ef4444' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
