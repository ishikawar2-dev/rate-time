'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Timer,
  Entry,
  Repayment,
  EntryWithRepayments,
  PaymentBreakdown,
  calculateEntryBalance,
  calculateEntryInterest,
  calculateTotalBalance,
  getPaymentBreakdown,
  formatCurrency,
  formatCurrencyWithDecimal,
  formatDate,
  rateTypeLabel,
  interestTypeLabel,
} from '@/lib/interest';
import { AffiliateSection } from '@/components/affiliate/AffiliateSection';

// ─── Celebration overlay ───────────────────────────────────────────
function CelebrationOverlay({
  amount,
  newBalance,
  entryName,
  breakdown,
  onClose,
}: {
  amount: number;
  newBalance: number;
  entryName: string | null;
  breakdown: PaymentBreakdown;
  onClose: () => void;
}) {
  useEffect(() => {
    (async () => {
      const confetti = (await import('canvas-confetti')).default;
      const end = Date.now() + 3000;
      const colors = ['#22c55e', '#4ade80', '#86efac', '#fbbf24', '#60a5fa'];
      const frame = () => {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    })();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-rt-card border border-rt-border-strong rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-slide-up">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-black text-rt-success-text mb-1">返済おめでとう！</h2>
        {entryName && <p className="text-rt-text-tertiary text-sm mb-1">{entryName}</p>}
        <p className="text-rt-text-tertiary text-sm mb-6">素晴らしい一歩です。この調子で！</p>

        <div className="bg-rt-success-bg border border-rt-success-border rounded-2xl p-4 mb-4">
          <p className="text-xs text-rt-success-text font-semibold mb-1">返済金額</p>
          <p className="text-3xl font-black text-rt-success-text">{formatCurrency(amount)}</p>
          {(breakdown.interest_paid > 0 || breakdown.principal_paid > 0) && (
            <div className="flex justify-center gap-4 mt-2 text-xs">
              {breakdown.interest_paid > 0 && (
                <span className="text-rt-interest-text">利息 {formatCurrency(breakdown.interest_paid)}</span>
              )}
              {breakdown.principal_paid > 0 && (
                <span className="text-rt-principal-text">元本 {formatCurrency(breakdown.principal_paid)}</span>
              )}
            </div>
          )}
        </div>

        {newBalance > 0 ? (
          <div className="bg-rt-accent-bg border border-rt-accent-border rounded-2xl p-4 mb-6">
            <p className="text-xs text-rt-accent-text font-semibold mb-1">この項目の残高</p>
            <p className="text-2xl font-bold text-rt-accent-text">{formatCurrency(newBalance)}</p>
          </div>
        ) : (
          <div className="bg-rt-success-bg border border-rt-success-border rounded-2xl p-4 mb-6">
            <p className="text-2xl font-bold text-rt-success-text">🏆 この項目を完済！</p>
          </div>
        )}

        <button onClick={onClose} className="btn-success w-full">閉じる</button>
      </div>
    </div>
  );
}

// ─── Balance ticker ────────────────────────────────────────────────
function BalanceTicker({ balance, large }: { balance: number; large?: boolean }) {
  const prevRef = useRef(balance);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (balance !== prevRef.current) {
      setBump(true);
      prevRef.current = balance;
      const t = setTimeout(() => setBump(false), 300);
      return () => clearTimeout(t);
    }
  }, [balance]);

  const text = large ? formatCurrencyWithDecimal(balance) : formatCurrency(balance);
  return (
    <span className={`balance-display transition-colors duration-300 ${bump ? 'text-rt-accent-text' : 'text-rt-accent-text'}`}>
      {text}
    </span>
  );
}

// ─── Add-entry inline form ─────────────────────────────────────────
function AddEntryForm({ slug, editToken, onAdded }: { slug: string; editToken: string; onAdded: (entry: Entry) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '', principal: '', interest_rate: '', rate_type: 'annual',
    interest_type: 'compound', started_at: '',
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const update = (f: string, v: string) => { setForm((p) => ({ ...p, [f]: v })); setErr(''); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    try {
      const res = await fetch(`/api/timers/${slug}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-edit-token': editToken },
        body: JSON.stringify({
          ...form,
          principal: parseFloat(form.principal),
          interest_rate: parseFloat(form.interest_rate),
          started_at: form.started_at ? new Date(form.started_at).getTime() : undefined,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const entry: Entry = await res.json();
      onAdded(entry);
      setForm({ name: '', principal: '', interest_rate: '', rate_type: 'annual', interest_type: 'compound', started_at: '' });
      setOpen(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3 rounded-xl border-2 border-dashed border-rt-border-strong text-rt-text-tertiary hover:border-rt-accent-border hover:text-rt-accent-text font-semibold text-sm transition-all duration-150"
      >
        + 元金を追加
      </button>
    );
  }

  return (
    <div className="card p-5 border-rt-border-strong">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-rt-text-primary text-sm">新しい元金を追加</h3>
        <button onClick={() => setOpen(false)} className="text-rt-text-muted hover:text-rt-text-secondary text-xl">×</button>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="label">項目名（任意）</label>
          <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)}
            placeholder="例：追加借入" className="input-field" maxLength={50} />
        </div>
        <div>
          <label className="label">元金 <span className="text-rt-accent-text">*</span></label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rt-text-tertiary font-semibold">¥</span>
            <input type="number" value={form.principal} onChange={(e) => update('principal', e.target.value)}
              placeholder="500,000" className="input-field pl-8" required min="1" step="1" />
          </div>
        </div>
        <div>
          <label className="label">金利 <span className="text-rt-accent-text">*</span></label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input type="number" value={form.interest_rate} onChange={(e) => update('interest_rate', e.target.value)}
                placeholder="18.0" className="input-field pr-8" required min="0" step="0.01" />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-rt-text-tertiary font-semibold">%</span>
            </div>
            <select value={form.rate_type} onChange={(e) => update('rate_type', e.target.value)}
              className="input-field w-24 flex-shrink-0">
              <option value="annual">年利</option>
              <option value="monthly">月利</option>
              <option value="daily">日利</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">利息タイプ</label>
          <div className="flex gap-2">
            {(['compound', 'simple'] as const).map((k) => (
              <button key={k} type="button" onClick={() => update('interest_type', k)}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm border transition-all ${
                  form.interest_type === k
                    ? 'bg-rt-accent-cta text-white border-rt-accent-cta'
                    : 'bg-rt-elevated text-rt-text-secondary border-rt-border-strong hover:border-rt-border-strong'
                }`}>
                {k === 'compound' ? '複利' : '単利'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">開始日時（空欄で今すぐ）</label>
          <input type="datetime-local" value={form.started_at} onChange={(e) => update('started_at', e.target.value)}
            className="input-field" />
        </div>
        {err && <div className="bg-rt-accent-bg border border-rt-accent-border rounded-xl p-3 text-sm text-rt-accent-text">{err}</div>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? '追加中...' : '追加する'}
        </button>
      </form>
    </div>
  );
}

// ─── Repayment form ────────────────────────────────────────────────
function RepaymentForm({
  slug,
  editToken,
  entries,
  defaultEntryId,
  onRepaid,
}: {
  slug: string;
  editToken: string;
  entries: EntryWithRepayments[];
  defaultEntryId?: string;
  onRepaid: (repayment: Repayment, breakdown: PaymentBreakdown) => void;
}) {
  const activeEntries = entries.filter((e) => calculateEntryBalance(e, e.repayments) > 0);

  const [form, setForm] = useState({
    entry_id: defaultEntryId ?? activeEntries[0]?.id ?? '',
    amount: '',
    item_name: '',
    note: '',
    repaid_at: '',
    repayment_target: 'interest' as 'interest' | 'principal',
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (defaultEntryId) setForm((p) => ({ ...p, entry_id: defaultEntryId }));
  }, [defaultEntryId]);

  const update = (f: string, v: string) => { setForm((p) => ({ ...p, [f]: v })); setErr(''); };

  const selectedEntry = entries.find((e) => e.id === form.entry_id);
  const selectedBalance = selectedEntry ? calculateEntryBalance(selectedEntry, selectedEntry.repayments) : 0;
  const selectedInterest = selectedEntry ? calculateEntryInterest(selectedEntry, selectedEntry.repayments) : 0;

  const previewAmount = parseFloat(form.amount) || 0;
  const previewBreakdown: PaymentBreakdown | null = previewAmount > 0 && selectedEntry
    ? form.repayment_target === 'principal'
      ? { interest_paid: 0, principal_paid: previewAmount }
      : {
          interest_paid: Math.min(selectedInterest, previewAmount),
          principal_paid: Math.max(0, previewAmount - Math.min(selectedInterest, previewAmount)),
        }
    : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    try {
      const amount = parseFloat(form.amount);
      const repaid_at_ms = form.repaid_at ? new Date(form.repaid_at).getTime() : Date.now();

      const res = await fetch(`/api/timers/${slug}/repayments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-edit-token': editToken },
        body: JSON.stringify({
          entry_id: form.entry_id,
          amount,
          item_name: form.item_name || null,
          note: form.note || null,
          repayment_target: form.repayment_target,
          repaid_at: repaid_at_ms,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const repayment: Repayment = await res.json();

      const priorRepayments = selectedEntry?.repayments ?? [];
      const breakdown = getPaymentBreakdown(repayment, selectedEntry!, priorRepayments);

      onRepaid(repayment, breakdown);
      setForm((p) => ({ ...p, amount: '', item_name: '', note: '', repaid_at: '' }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (activeEntries.length === 0) return null;

  return (
    <div className="card p-5">
      <h2 className="font-bold text-rt-text-primary mb-4">💸 返済を記録する</h2>
      <form onSubmit={submit} className="space-y-3">
        {/* Entry selector */}
        <div>
          <label className="label">返済する項目 <span className="text-rt-accent-text">*</span></label>
          <select value={form.entry_id} onChange={(e) => update('entry_id', e.target.value)} className="input-field">
            {activeEntries.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name || `項目 ${entries.indexOf(e) + 1}`}
                {' '}（残高: {formatCurrency(calculateEntryBalance(e, e.repayments))}）
              </option>
            ))}
          </select>
        </div>

        {/* Repayment target */}
        <div>
          <label className="label">充当先</label>
          <div className="flex gap-2">
            {(['interest', 'principal'] as const).map((t) => (
              <button key={t} type="button" onClick={() => update('repayment_target', t)}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm border transition-all duration-150 ${
                  form.repayment_target === t
                    ? t === 'interest'
                      ? 'bg-rt-interest-cta text-white border-rt-interest-cta'
                      : 'bg-rt-principal-cta text-white border-rt-principal-cta'
                    : 'bg-rt-elevated text-rt-text-secondary border-rt-border-strong hover:border-rt-border-strong'
                }`}>
                {t === 'interest' ? '利息から（推奨）' : '元本から'}
              </button>
            ))}
          </div>
          <p className="text-xs text-rt-text-muted mt-1.5">
            {form.repayment_target === 'interest'
              ? `利息を優先して返済します。現在の発生利息: ${formatCurrency(selectedInterest)}`
              : '利息に充当せず、元本を直接減らします。利息は引き続き発生します。'}
          </p>
        </div>

        {/* Amount */}
        <div>
          <label className="label">返済金額 <span className="text-rt-accent-text">*</span></label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rt-text-tertiary font-semibold">¥</span>
            <input type="number" value={form.amount} onChange={(e) => update('amount', e.target.value)}
              placeholder={Math.ceil(selectedBalance).toString()} className="input-field pl-8"
              required min="1" step="1" />
          </div>
          {selectedBalance > 0 && (
            <button type="button"
              onClick={() => update('amount', Math.ceil(selectedBalance).toString())}
              className="mt-1.5 text-xs text-rt-accent-text hover:text-rt-accent-text font-semibold">
              → 残高全額 {formatCurrency(selectedBalance)} を入力
            </button>
          )}
          {previewBreakdown && (previewBreakdown.interest_paid > 0 || previewBreakdown.principal_paid > 0) && (
            <div className="mt-2 flex gap-3 text-xs bg-rt-elevated rounded-lg px-3 py-2 border border-rt-border-strong">
              <span className="text-rt-text-tertiary">充当内訳:</span>
              {previewBreakdown.interest_paid > 0 && (
                <span className="text-rt-interest-text font-semibold">利息 {formatCurrency(previewBreakdown.interest_paid)}</span>
              )}
              {previewBreakdown.principal_paid > 0 && (
                <span className="text-rt-principal-text font-semibold">元本 {formatCurrency(previewBreakdown.principal_paid)}</span>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="label">項目名（任意）</label>
          <input type="text" value={form.item_name} onChange={(e) => update('item_name', e.target.value)}
            placeholder="例：第1回返済" className="input-field" maxLength={50} />
        </div>

        <div>
          <label className="label">メモ（任意）</label>
          <input type="text" value={form.note} onChange={(e) => update('note', e.target.value)}
            placeholder="備考など" className="input-field" maxLength={200} />
        </div>

        <div>
          <label className="label">返済日時（空欄で現在時刻）</label>
          <input type="datetime-local" value={form.repaid_at} onChange={(e) => update('repaid_at', e.target.value)}
            className="input-field" />
        </div>

        {err && <div className="bg-rt-accent-bg border border-rt-accent-border rounded-xl p-3 text-sm text-rt-accent-text">{err}</div>}

        <button type="submit" disabled={loading} className="btn-success w-full text-base">
          {loading ? '処理中...' : '✅ 返済する'}
        </button>
      </form>
    </div>
  );
}

// ─── Edit entry modal ──────────────────────────────────────────────
function EditEntryModal({
  slug,
  editToken,
  entry,
  onSaved,
  onClose,
}: {
  slug: string;
  editToken: string;
  entry: EntryWithRepayments;
  onSaved: (updated: Entry) => void;
  onClose: () => void;
}) {
  const toLocalDatetime = (ms: number) => {
    const d = new Date(ms);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [form, setForm] = useState({
    name: entry.name ?? '',
    principal: String(entry.principal),
    interest_rate: String(entry.interest_rate),
    rate_type: entry.rate_type,
    interest_type: entry.interest_type,
    started_at: toLocalDatetime(entry.started_at),
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const update = (f: string, v: string) => { setForm((p) => ({ ...p, [f]: v })); setErr(''); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    try {
      const res = await fetch(`/api/timers/${slug}/entries/${entry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-edit-token': editToken },
        body: JSON.stringify({
          name: form.name,
          principal: parseFloat(form.principal),
          interest_rate: parseFloat(form.interest_rate),
          rate_type: form.rate_type,
          interest_type: form.interest_type,
          started_at: form.started_at ? new Date(form.started_at).getTime() : entry.started_at,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const updated: Entry = await res.json();
      onSaved(updated);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-rt-card border border-rt-border-strong rounded-3xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-rt-text-primary">元金を編集</h2>
          <button onClick={onClose} className="text-rt-text-muted hover:text-rt-text-secondary text-xl">×</button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="label">項目名（任意）</label>
            <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)}
              placeholder="例：追加借入" className="input-field" maxLength={50} />
          </div>
          <div>
            <label className="label">元金 <span className="text-rt-accent-text">*</span></label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rt-text-tertiary font-semibold">¥</span>
              <input type="number" value={form.principal} onChange={(e) => update('principal', e.target.value)}
                placeholder="500,000" className="input-field pl-8" required min="1" step="1" />
            </div>
          </div>
          <div>
            <label className="label">金利 <span className="text-rt-accent-text">*</span></label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input type="number" value={form.interest_rate} onChange={(e) => update('interest_rate', e.target.value)}
                  placeholder="18.0" className="input-field pr-8" required min="0" step="0.01" />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-rt-text-tertiary font-semibold">%</span>
              </div>
              <select value={form.rate_type} onChange={(e) => update('rate_type', e.target.value)}
                className="input-field w-24 flex-shrink-0">
                <option value="annual">年利</option>
                <option value="monthly">月利</option>
                <option value="daily">日利</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">利息タイプ</label>
            <div className="flex gap-2">
              {(['compound', 'simple'] as const).map((k) => (
                <button key={k} type="button" onClick={() => update('interest_type', k)}
                  className={`flex-1 py-2.5 rounded-xl font-semibold text-sm border transition-all ${
                    form.interest_type === k
                      ? 'bg-rt-accent-cta text-white border-rt-accent-cta'
                      : 'bg-rt-elevated text-rt-text-secondary border-rt-border-strong hover:border-rt-border-strong'
                  }`}>
                  {k === 'compound' ? '複利' : '単利'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">開始日時</label>
            <input type="datetime-local" value={form.started_at} onChange={(e) => update('started_at', e.target.value)}
              className="input-field" />
          </div>
          {err && <div className="bg-rt-accent-bg border border-rt-accent-border rounded-xl p-3 text-sm text-rt-accent-text">{err}</div>}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">キャンセル</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? '保存中...' : '保存する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Entry card ────────────────────────────────────────────────────
function EntryCard({
  entry,
  index,
  canEdit,
  onRepayClick,
  onEditClick,
}: {
  entry: EntryWithRepayments;
  index: number;
  canEdit: boolean;
  onRepayClick: (entryId: string) => void;
  onEditClick: (entry: EntryWithRepayments) => void;
}) {
  const [balance, setBalance] = useState(0);
  const [interest, setInterest] = useState(0);

  useEffect(() => {
    const update = () => {
      setBalance(calculateEntryBalance(entry, entry.repayments));
      setInterest(calculateEntryInterest(entry, entry.repayments));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [entry]);

  const totalRepaid = entry.repayments.reduce((s, r) => s + r.amount, 0);
  const isPaid = balance <= 0;

  return (
    <div className={`card p-4 ${isPaid ? 'border-rt-success-border bg-rt-success-bg' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-xs font-bold text-rt-text-muted uppercase tracking-wide">元金 {index + 1}</span>
          <h3 className="font-bold text-rt-text-primary leading-tight">
            {entry.name || `項目 ${index + 1}`}
          </h3>
          <p className="text-xs text-rt-text-muted mt-0.5">
            {entry.interest_rate}%&nbsp;{rateTypeLabel(entry.rate_type)}&nbsp;/&nbsp;
            {interestTypeLabel(entry.interest_type)}
            &nbsp;・&nbsp;開始: {formatDate(entry.started_at)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 ml-3 flex-shrink-0">
          {isPaid ? (
            <span className="text-rt-success-text font-black text-sm">🏆 完済</span>
          ) : (
            <BalanceTicker balance={balance} />
          )}
          {canEdit && (
            <button
              onClick={() => onEditClick(entry)}
              className="text-xs text-rt-text-tertiary hover:text-rt-text-primary px-2 py-0.5 rounded-lg border border-rt-border-strong hover:border-rt-text-tertiary transition-colors"
            >
              編集
            </button>
          )}
        </div>
      </div>

      {!isPaid && (
        <>
          <div className="flex gap-3 text-xs mb-3">
            <div>
              <span className="text-rt-text-muted">元金</span>{' '}
              <span className="font-bold text-rt-text-primary">{formatCurrency(entry.principal)}</span>
            </div>
            <div>
              <span className="text-rt-text-muted">利息</span>{' '}
              <span className="font-bold text-rt-interest-text">{formatCurrency(interest)}</span>
            </div>
            {totalRepaid > 0 && (
              <div>
                <span className="text-rt-text-muted">返済済</span>{' '}
                <span className="font-bold text-rt-success-text">{formatCurrency(totalRepaid)}</span>
              </div>
            )}
          </div>
          {canEdit && (
            <button
              onClick={() => onRepayClick(entry.id)}
              className="w-full py-2 rounded-lg bg-rt-success-bg hover:bg-rt-success-bg text-rt-success-text font-semibold text-sm border border-rt-success-border transition-colors"
            >
              この項目を返済する
            </button>
          )}
        </>
      )}

      {isPaid && totalRepaid > 0 && (
        <p className="text-xs text-rt-success-text">合計返済額: {formatCurrency(totalRepaid)}</p>
      )}
    </div>
  );
}

// ─── Edit repayment modal ──────────────────────────────────────────
function EditRepaymentModal({
  slug,
  editToken,
  repayment,
  entryName,
  onSaved,
  onClose,
}: {
  slug: string;
  editToken: string;
  repayment: Repayment & { entryName: string };
  entryName: string;
  onSaved: (updated: Repayment) => void;
  onClose: () => void;
}) {
  const toLocalDatetime = (ms: number) => {
    const d = new Date(ms);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [form, setForm] = useState({
    amount: String(repayment.amount),
    item_name: repayment.item_name ?? '',
    note: repayment.note ?? '',
    repayment_target: repayment.repayment_target,
    repaid_at: toLocalDatetime(repayment.repaid_at),
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const update = (f: string, v: string) => { setForm((p) => ({ ...p, [f]: v })); setErr(''); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    try {
      const res = await fetch(`/api/timers/${slug}/repayments/${repayment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-edit-token': editToken },
        body: JSON.stringify({
          amount: parseFloat(form.amount),
          item_name: form.item_name || null,
          note: form.note || null,
          repayment_target: form.repayment_target,
          repaid_at: form.repaid_at ? new Date(form.repaid_at).getTime() : repayment.repaid_at,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const updated: Repayment = await res.json();
      onSaved(updated);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-rt-card border border-rt-border-strong rounded-3xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-rt-text-primary">返済履歴を編集</h2>
          <button onClick={onClose} className="text-rt-text-muted hover:text-rt-text-secondary text-xl">×</button>
        </div>
        <p className="text-xs text-rt-text-tertiary mb-4">{entryName}</p>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="label">返済金額 <span className="text-rt-accent-text">*</span></label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rt-text-tertiary font-semibold">¥</span>
              <input type="number" value={form.amount} onChange={(e) => update('amount', e.target.value)}
                className="input-field pl-8" required min="1" step="1" />
            </div>
          </div>
          <div>
            <label className="label">充当先</label>
            <div className="flex gap-2">
              {(['interest', 'principal'] as const).map((t) => (
                <button key={t} type="button" onClick={() => update('repayment_target', t)}
                  className={`flex-1 py-2.5 rounded-xl font-semibold text-sm border transition-all duration-150 ${
                    form.repayment_target === t
                      ? t === 'interest' ? 'bg-rt-interest-cta text-white border-rt-interest-cta' : 'bg-rt-principal-cta text-white border-rt-principal-cta'
                      : 'bg-rt-elevated text-rt-text-secondary border-rt-border-strong hover:border-rt-border-strong'
                  }`}>
                  {t === 'interest' ? '利息から' : '元本から'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">項目名（任意）</label>
            <input type="text" value={form.item_name} onChange={(e) => update('item_name', e.target.value)}
              className="input-field" maxLength={50} />
          </div>
          <div>
            <label className="label">メモ（任意）</label>
            <input type="text" value={form.note} onChange={(e) => update('note', e.target.value)}
              className="input-field" maxLength={200} />
          </div>
          <div>
            <label className="label">返済日時</label>
            <input type="datetime-local" value={form.repaid_at} onChange={(e) => update('repaid_at', e.target.value)}
              className="input-field" />
          </div>
          {err && <div className="bg-rt-accent-bg border border-rt-accent-border rounded-xl p-3 text-sm text-rt-accent-text">{err}</div>}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">キャンセル</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? '保存中...' : '保存する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main client component ─────────────────────────────────────────
interface TimerClientProps {
  timer: Timer;
  initialEntries: EntryWithRepayments[];
  editToken: string | null;
  /** アクティブな実験 ID（middleware + cookie 経由、親 page.tsx で取得） */
  experimentId?: string;
  /** 割り当てられたバリアント ID */
  variantId?: string;
}

export function TimerClient({
  timer,
  initialEntries,
  editToken,
  experimentId,
  variantId,
}: TimerClientProps) {
  const canEdit = editToken !== null;
  const [entries, setEntries] = useState<EntryWithRepayments[]>(initialEntries);
  const [totalBalance, setTotalBalance] = useState(0);
  const [celebration, setCelebration] = useState<{
    amount: number; newBalance: number; entryName: string | null; breakdown: PaymentBreakdown;
  } | null>(null);
  const [repayTargetId, setRepayTargetId] = useState<string | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  const [editingRepayment, setEditingRepayment] = useState<(Repayment & { entryName: string }) | null>(null);
  const [editingEntry, setEditingEntry] = useState<EntryWithRepayments | null>(null);

  const repayFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => setTotalBalance(calculateTotalBalance(entries));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [entries]);

  const allPaid = entries.length > 0 && entries.every(
    (e) => calculateEntryBalance(e, e.repayments) <= 0,
  );

  const handleRepayClick = (entryId: string) => {
    setRepayTargetId(entryId);
    setTimeout(() => {
      repayFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleRepaid = useCallback(
    (repayment: Repayment, breakdown: PaymentBreakdown) => {
      const entryId = repayment.entry_id;
      const updatedEntries = entries.map((e) => {
        if (e.id !== entryId) return e;
        return { ...e, repayments: [...e.repayments, repayment] };
      });
      setEntries(updatedEntries);

      const entry = updatedEntries.find((e) => e.id === entryId);
      const newBalance = entry ? calculateEntryBalance(entry, entry.repayments) : 0;
      setCelebration({ amount: repayment.amount, newBalance, entryName: entry?.name ?? null, breakdown });
    },
    [entries],
  );

  const handleEntryAdded = useCallback((newEntry: Entry) => {
    setEntries((prev) => [...prev, { ...newEntry, repayments: [] }]);
  }, []);

  const handleDeleteRepayment = useCallback(async (repaymentId: string, entryId: string) => {
    if (!confirm('この返済履歴を削除しますか？')) return;
    try {
      const res = await fetch(`/api/timers/${timer.slug}/repayments/${repaymentId}`, {
        method: 'DELETE',
        headers: editToken ? { 'x-edit-token': editToken } : {},
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setEntries((prev) => prev.map((e) =>
        e.id !== entryId ? e : { ...e, repayments: e.repayments.filter((r) => r.id !== repaymentId) }
      ));
    } catch (e) {
      alert(e instanceof Error ? e.message : '削除に失敗しました');
    }
  }, [timer.slug]);

  const handleSaveRepayment = useCallback((updated: Repayment) => {
    setEntries((prev) => prev.map((e) =>
      e.id !== updated.entry_id ? e : { ...e, repayments: e.repayments.map((r) => r.id === updated.id ? updated : r) }
    ));
    setEditingRepayment(null);
  }, []);

  const handleSaveEntry = useCallback((updated: Entry) => {
    setEntries((prev) => prev.map((e) =>
      e.id !== updated.id ? e : { ...e, ...updated }
    ));
    setEditingEntry(null);
  }, []);

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const allRepayments = entries
    .flatMap((e) =>
      e.repayments.map((r) => {
        const prior = e.repayments.filter((p) => p.repaid_at < r.repaid_at);
        return {
          ...r,
          entryName: e.name ?? `項目 ${entries.indexOf(e) + 1}`,
          breakdown: getPaymentBreakdown(r, e, prior),
        };
      }),
    )
    .sort((a, b) => b.repaid_at - a.repaid_at);

  const totalRepaid = entries.flatMap((e) => e.repayments).reduce((s, r) => s + r.amount, 0);

  return (
    <>
      {editingEntry && canEdit && (
        <EditEntryModal
          slug={timer.slug}
          editToken={editToken!}
          entry={editingEntry}
          onSaved={handleSaveEntry}
          onClose={() => setEditingEntry(null)}
        />
      )}
      {editingRepayment && canEdit && (
        <EditRepaymentModal
          slug={timer.slug}
          editToken={editToken!}
          repayment={editingRepayment}
          entryName={editingRepayment.entryName}
          onSaved={handleSaveRepayment}
          onClose={() => setEditingRepayment(null)}
        />
      )}
      {celebration && (
        <CelebrationOverlay
          amount={celebration.amount}
          newBalance={celebration.newBalance}
          entryName={celebration.entryName}
          breakdown={celebration.breakdown}
          onClose={() => setCelebration(null)}
        />
      )}

      <main className="min-h-screen p-4 py-8">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <a href="/" className="text-xs text-rt-text-muted hover:text-rt-text-secondary mb-1 inline-block transition-colors">
                ← ホームに戻る
              </a>
              <h1 className="text-xl font-black text-rt-text-primary">
                {timer.name || '利息タイマー'}
              </h1>
              <p className="text-xs text-rt-text-muted mt-0.5">開始: {formatDate(timer.created_at)}</p>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <button onClick={handleCopyUrl} className="btn-secondary text-xs py-2 px-3">
                {copied ? '✅ コピー済' : '🔗 URLをコピー'}
              </button>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${
                canEdit
                  ? 'bg-rt-success-bg text-rt-success-text border-rt-success-border'
                  : 'bg-rt-card text-rt-text-tertiary border-rt-border-strong'
              }`}>
                {canEdit ? '🔓 編集モード' : '🔒 閲覧のみ'}
              </span>
            </div>
          </div>

          {/* Total balance */}
          <div className={`card p-6 text-center ${allPaid ? 'border-rt-success-border bg-rt-success-bg' : ''}`}>
            {allPaid ? (
              <>
                <p className="text-5xl mb-2">🏆</p>
                <h2 className="text-2xl font-black text-rt-success-text mb-1">全項目完済！</h2>
                <p className="text-rt-success-text text-sm">おめでとうございます！</p>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold text-rt-text-muted uppercase tracking-widest mb-2">
                  合計残高（全項目）
                </p>
                <div className="text-4xl sm:text-5xl font-black mb-3 leading-none">
                  <BalanceTicker balance={totalBalance} large />
                </div>
                <div className="flex justify-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-rt-text-muted text-xs mb-0.5">元金合計</p>
                    <p className="font-bold text-rt-text-primary">
                      {formatCurrency(entries.reduce((s, e) => s + e.principal, 0))}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-rt-text-muted text-xs mb-0.5">返済済合計</p>
                    <p className="font-bold text-rt-success-text">{formatCurrency(totalRepaid)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-rt-text-muted text-xs mb-0.5">項目数</p>
                    <p className="font-bold text-rt-text-primary">{entries.length}件</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Entry cards */}
          <div className="space-y-2">
            <h2 className="font-bold text-rt-text-tertiary text-sm px-1">元金一覧</h2>
            {entries.map((entry, idx) => (
              <EntryCard key={entry.id} entry={entry} index={idx} canEdit={canEdit} onRepayClick={handleRepayClick} onEditClick={setEditingEntry} />
            ))}
            {canEdit && (
              <AddEntryForm slug={timer.slug} editToken={editToken!} onAdded={handleEntryAdded} />
            )}
          </div>

          {/* Repayment form */}
          {!allPaid && canEdit && (
            <div ref={repayFormRef}>
              <RepaymentForm
                slug={timer.slug}
                editToken={editToken!}
                entries={entries}
                defaultEntryId={repayTargetId}
                onRepaid={handleRepaid}
              />
            </div>
          )}

          {/* Repayment history */}
          {allRepayments.length > 0 && (
            <div className="card p-5">
              <h2 className="font-bold text-rt-text-primary mb-3">
                📋 返済履歴（{allRepayments.length}件）
              </h2>
              <div className="space-y-2">
                {allRepayments.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-start justify-between bg-rt-success-bg rounded-xl p-3 border border-rt-success-border"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="font-bold text-rt-success-text text-sm">{r.item_name || '返済'}</p>
                        <span className="text-xs bg-rt-elevated text-rt-text-secondary px-1.5 py-0.5 rounded-full border border-rt-border-strong">
                          {r.entryName}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full border ${
                          r.repayment_target === 'interest'
                            ? 'bg-rt-interest-bg text-rt-interest-text border-rt-interest-border'
                            : 'bg-rt-principal-bg text-rt-principal-text border-rt-principal-border'
                        }`}>
                          {r.repayment_target === 'interest' ? '利息優先' : '元本優先'}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-0.5">
                        {r.breakdown.interest_paid > 0 && (
                          <span className="text-xs text-rt-interest-text">利息 {formatCurrency(r.breakdown.interest_paid)}</span>
                        )}
                        {r.breakdown.principal_paid > 0 && (
                          <span className="text-xs text-rt-principal-text">元本 {formatCurrency(r.breakdown.principal_paid)}</span>
                        )}
                      </div>
                      {r.note && <p className="text-xs text-rt-text-muted mt-0.5 truncate">{r.note}</p>}
                      <p className="text-xs text-rt-text-muted mt-0.5">{formatDate(r.repaid_at)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 ml-3 flex-shrink-0">
                      <p className="font-black text-rt-success-text">
                        {formatCurrency(r.amount)}
                      </p>
                      {canEdit && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditingRepayment(r)}
                            className="text-xs text-rt-text-tertiary hover:text-rt-text-primary px-2 py-0.5 rounded-lg border border-rt-border-strong hover:border-rt-text-tertiary transition-colors"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleDeleteRepayment(r.id, r.entry_id)}
                            className="text-xs text-rt-accent-text hover:text-rt-accent-text px-2 py-0.5 rounded-lg border border-rt-accent-border hover:border-rt-accent-border transition-colors"
                          >
                            削除
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-rt-border flex justify-between text-sm">
                <span className="text-rt-text-tertiary font-medium">合計返済額</span>
                <span className="font-black text-rt-success-text">{formatCurrency(totalRepaid)}</span>
              </div>
            </div>
          )}

          {allRepayments.length === 0 && (
            <div className="card p-5 text-center text-rt-text-muted">
              <p className="text-sm">まだ返済の記録がありません</p>
            </div>
          )}
        </div>

        {/* アフィリエイトセクション（docs/MONETIZATION.md §6.1） */}
        {entries.length >= 2 && (
          <AffiliateSection
            category="loan-consolidation"
            title="複数の借金をまとめて金利を下げる"
            leadText="複数の借金をひとつにまとめることで、月々の返済額・総利息を減らせる可能性があります。"
            placement="timer-loan-consolidation"
            experimentId={experimentId}
            variantId={variantId}
          />
        )}
        <AffiliateSection
          category="debt-consolidation"
          title="返済が厳しい方へ：無料の借金相談"
          leadText="利息が膨らみ返済が困難な場合、弁護士・司法書士への相談で解決できるケースがあります。相談は無料です。"
          placement="timer-debt-consolidation"
          experimentId={experimentId}
          variantId={variantId}
        />
      </main>
    </>
  );
}
