'use client';

import { useEffect, useState } from 'react';
import type { TimerTheme } from '@/lib/interest';
import { ThemeToggle } from '@/components/ThemeToggle';

type RateType = 'annual' | 'monthly' | 'daily';
type InterestType = 'simple' | 'compound';

interface EntryForm {
  _key: number;
  name: string;
  principal: string;
  interest_rate: string;
  rate_type: RateType;
  interest_type: InterestType;
  started_at: string;
}

const RATE_LABELS: Record<RateType, string> = { annual: '年利', monthly: '月利', daily: '日利' };
const INTEREST_LABELS: Record<InterestType, string> = { simple: '単利', compound: '複利' };

let nextKey = 1;

function newEntry(): EntryForm {
  return {
    _key: nextKey++,
    name: '',
    principal: '',
    interest_rate: '',
    rate_type: 'annual',
    interest_type: 'compound',
    started_at: '',
  };
}

export default function HomeClient() {
  const [timerName, setTimerName] = useState('');
  const [theme, setTheme] = useState<TimerTheme>('light');
  const [entries, setEntries] = useState<EntryForm[]>([newEntry()]);
  const [generatedUrls, setGeneratedUrls] = useState<{ viewUrl: string; editUrl: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedView, setCopiedView] = useState(false);
  const [copiedEdit, setCopiedEdit] = useState(false);

  // トグル切替を body / html の data-theme にリアルタイム反映（トップページでのプレビュー目的）
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const updateEntry = (key: number, field: keyof EntryForm, value: string) => {
    setEntries((prev) =>
      prev.map((e) => (e._key === key ? { ...e, [field]: value } : e)),
    );
    setError('');
  };

  const addEntry = () => setEntries((prev) => [...prev, newEntry()]);

  const removeEntry = (key: number) => {
    if (entries.length <= 1) return;
    setEntries((prev) => prev.filter((e) => e._key !== key));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const payload = {
        name: timerName,
        theme,
        entries: entries.map((e) => ({
          name: e.name,
          principal: parseFloat(e.principal),
          interest_rate: parseFloat(e.interest_rate),
          rate_type: e.rate_type,
          interest_type: e.interest_type,
          started_at: e.started_at ? new Date(e.started_at).getTime() : undefined,
        })),
      };

      const res = await fetch('/api/timers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'エラーが発生しました');
      }

      const data = await res.json();
      const base = `${window.location.origin}/timer/${data.slug}`;
      setGeneratedUrls({
        viewUrl: base,
        editUrl: `${base}?e=${data.edit_token}`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyView = async () => {
    if (!generatedUrls) return;
    await navigator.clipboard.writeText(generatedUrls.viewUrl);
    setCopiedView(true);
    setTimeout(() => setCopiedView(false), 2000);
  };

  const handleCopyEdit = async () => {
    if (!generatedUrls) return;
    await navigator.clipboard.writeText(generatedUrls.editUrl);
    setCopiedEdit(true);
    setTimeout(() => setCopiedEdit(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-rt-accent-bg border border-rt-accent-border rounded-2xl mb-4">
            <span className="text-3xl">⏱️</span>
          </div>
          <h1 className="text-3xl font-black text-rt-text-primary mb-2">利息タイマー</h1>
          <p className="text-rt-text-tertiary text-sm">
            リアルタイムで増える利息を可視化する借金時計・利息シミュレーター。返済の動機づけに。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* テーマトグル */}
          <div className="card p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-rt-text-primary">テーマ</p>
              <p className="text-xs text-rt-text-tertiary mt-0.5">
                タイマーごとに保存されます（共有先にも反映）
              </p>
            </div>
            <ThemeToggle value={theme} onChange={setTheme} />
          </div>

          {/* Timer name */}
          <div className="card p-5">
            <label className="label">タイマー名（任意）</label>
            <input
              type="text"
              value={timerName}
              onChange={(e) => setTimerName(e.target.value)}
              placeholder="例：2024年の借金まとめ"
              className="input-field"
              maxLength={50}
            />
          </div>

          {/* Entries */}
          <div className="space-y-3">
            {entries.map((entry, idx) => (
              <div key={entry._key} className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-rt-text-secondary text-sm">元金 {idx + 1}</h3>
                  {entries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEntry(entry._key)}
                      className="text-rt-text-muted hover:text-rt-accent-text transition-colors text-xl leading-none"
                      aria-label="削除"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="label">項目名（任意）</label>
                    <input
                      type="text"
                      value={entry.name}
                      onChange={(e) => updateEntry(entry._key, 'name', e.target.value)}
                      placeholder="例：カードローン、友達への借金"
                      className="input-field"
                      maxLength={50}
                    />
                  </div>

                  <div>
                    <label className="label">
                      元金 <span className="text-rt-accent-text">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rt-text-tertiary font-semibold">¥</span>
                      <input
                        type="number"
                        value={entry.principal}
                        onChange={(e) => updateEntry(entry._key, 'principal', e.target.value)}
                        placeholder="1,000,000"
                        className="input-field pl-8"
                        required
                        min="1"
                        step="1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">
                      金利 <span className="text-rt-accent-text">*</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          value={entry.interest_rate}
                          onChange={(e) => updateEntry(entry._key, 'interest_rate', e.target.value)}
                          placeholder="18.0"
                          className="input-field pr-8"
                          required
                          min="0"
                          max="9999"
                          step="0.01"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-rt-text-tertiary font-semibold">%</span>
                      </div>
                      <select
                        value={entry.rate_type}
                        onChange={(e) => updateEntry(entry._key, 'rate_type', e.target.value)}
                        className="input-field w-24 flex-shrink-0"
                      >
                        {(Object.keys(RATE_LABELS) as RateType[]).map((k) => (
                          <option key={k} value={k}>{RATE_LABELS[k]}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label">利息タイプ</label>
                    <div className="flex gap-2">
                      {(Object.keys(INTEREST_LABELS) as InterestType[]).map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => updateEntry(entry._key, 'interest_type', k)}
                          className={`flex-1 py-2.5 rounded-xl font-semibold text-sm border transition-all duration-150 ${
                            entry.interest_type === k
                              ? 'bg-rt-accent-cta text-white border-rt-accent-cta'
                              : 'bg-rt-elevated text-rt-text-secondary border-rt-border-strong hover:border-rt-text-tertiary'
                          }`}
                        >
                          {INTEREST_LABELS[k]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="label">開始日時（空欄で今すぐ）</label>
                    <input
                      type="datetime-local"
                      value={entry.started_at}
                      onChange={(e) => updateEntry(entry._key, 'started_at', e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addEntry}
              className="w-full py-3 rounded-xl border-2 border-dashed border-rt-border-strong text-rt-text-tertiary hover:border-rt-accent-border hover:text-rt-accent-text font-semibold text-sm transition-all duration-150"
            >
              + 元金を追加
            </button>
          </div>

          {error && (
            <div className="bg-rt-accent-bg border border-rt-accent-border rounded-xl p-3 text-sm text-rt-accent-text">
              {error}
            </div>
          )}

          <button type="submit" disabled={isLoading} className="btn-primary w-full text-base">
            {isLoading ? '生成中...' : '⏱️ タイマーを生成'}
          </button>
        </form>

        {/* Generated URLs */}
        {generatedUrls && (
          <div className="card p-5 bg-rt-success-bg border-rt-success-border mt-4 animate-slide-up space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-rt-success-text text-lg">✅</span>
              <h3 className="font-bold text-rt-success-text">タイマーが生成されました！</h3>
            </div>

            {/* 閲覧URL */}
            <div>
              <p className="text-xs font-bold text-rt-text-primary mb-1">📋 閲覧URL <span className="text-rt-text-tertiary font-normal">（相手に共有する）</span></p>
              <div className="bg-rt-elevated rounded-xl p-3 border border-rt-border-strong mb-2 break-all text-xs text-rt-text-secondary font-mono">
                {generatedUrls.viewUrl}
              </div>
              <div className="flex gap-2">
                <button onClick={handleCopyView} className="flex-1 btn-secondary text-sm py-2.5">
                  {copiedView ? '✅ コピーしました' : '📋 閲覧URLをコピー'}
                </button>
                <button
                  onClick={() => window.open(generatedUrls.viewUrl, '_blank')}
                  className="flex-1 btn-success text-sm py-2.5"
                >
                  🔗 開く
                </button>
              </div>
            </div>

            {/* 編集URL */}
            <div className="bg-rt-accent-bg border border-rt-accent-border rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-rt-accent-text">🔒 編集URL <span className="opacity-70 font-normal">（自分だけ保存・絶対に共有しない）</span></p>
              <p className="text-xs text-rt-text-tertiary">返済の記録・編集はこのURLからのみ可能です。メモやパスワードマネージャーに保存してください。</p>
              <div className="bg-rt-elevated rounded-xl p-3 border border-rt-border-strong break-all text-xs text-rt-text-secondary font-mono">
                {generatedUrls.editUrl}
              </div>
              <button onClick={handleCopyEdit} className="w-full btn-secondary text-sm py-2.5">
                {copiedEdit ? '✅ コピーしました' : '🔒 編集URLをコピー'}
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-rt-text-muted mt-6">
          生成されたURLでリアルタイムの返済額が確認できます
        </p>
      </div>
    </div>
  );
}
