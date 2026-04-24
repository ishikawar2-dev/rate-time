'use client';

import type { TimerTheme } from '@/lib/interest';

interface ThemeToggleProps {
  value: TimerTheme;
  onChange: (next: TimerTheme) => void;
}

/**
 * ライト⇔ダークの iOS 風トグルスイッチ。
 * role="switch" と aria-checked でアクセシビリティに対応、
 * キーボード操作（Enter / Space）で切替可能。
 */
export function ThemeToggle({ value, onChange }: ThemeToggleProps) {
  const isDark = value === 'dark';

  const toggle = () => onChange(isDark ? 'light' : 'dark');

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden
        className={`text-base transition-opacity ${isDark ? 'opacity-30' : 'opacity-100'}`}
      >
        ☀️
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label="テーマ切替（ダーク ⇔ ライト）"
        onClick={toggle}
        onKeyDown={onKeyDown}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-rt-accent-cta focus:ring-offset-2 focus:ring-offset-rt-bg ${
          isDark
            ? 'bg-rt-accent-cta border-rt-accent-cta'
            : 'bg-rt-elevated border-rt-border-strong'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            isDark ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <span
        aria-hidden
        className={`text-base transition-opacity ${isDark ? 'opacity-100' : 'opacity-30'}`}
      >
        🌙
      </span>
    </div>
  );
}
