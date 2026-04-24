export type TimerTheme = 'light' | 'dark';

export interface Timer {
  id: string;
  slug: string;
  name: string | null;
  theme: TimerTheme;
  created_at: number;
}

export interface Entry {
  id: string;
  timer_id: string;
  name: string | null;
  principal: number;
  interest_rate: number;
  rate_type: 'annual' | 'monthly' | 'daily';
  interest_type: 'simple' | 'compound';
  started_at: number;
  created_at: number;
}

export interface Repayment {
  id: string;
  entry_id: string;
  amount: number;
  item_name: string | null;
  note: string | null;
  repayment_target: 'interest' | 'principal';
  repaid_at: number;
  created_at: number;
}

export interface PaymentBreakdown {
  interest_paid: number;
  principal_paid: number;
}

export interface EntryWithRepayments extends Entry {
  repayments: Repayment[];
}

const SECONDS_PER_YEAR = 365 * 24 * 3600;

function toAnnualRate(rate: number, rateType: 'annual' | 'monthly' | 'daily'): number {
  const r = rate / 100;
  switch (rateType) {
    case 'annual': return r;
    case 'monthly': return r * 12;
    case 'daily': return r * 365;
  }
}

export function calculateEntryBalance(
  entry: Entry,
  repayments: Repayment[],
  atTime?: number,
): number {
  const now = atTime ?? Date.now();
  const annualRate = toAnnualRate(entry.interest_rate, entry.rate_type);
  const sorted = [...repayments]
    .filter((r) => r.repaid_at <= now)
    .sort((a, b) => a.repaid_at - b.repaid_at);

  if (entry.interest_type === 'simple') {
    const elapsedSec = (now - entry.started_at) / 1000;
    const perSecRate = annualRate / SECONDS_PER_YEAR;
    const interest = entry.principal * perSecRate * elapsedSec;
    const totalRepaid = sorted.reduce((s, r) => s + r.amount, 0);
    return Math.max(0, entry.principal + interest - totalRepaid);
  }

  const perSecRate = Math.pow(1 + annualRate, 1 / SECONDS_PER_YEAR) - 1;
  let balance = entry.principal;
  let lastTime = entry.started_at;

  for (const repayment of sorted) {
    const elapsedSec = (repayment.repaid_at - lastTime) / 1000;
    balance = balance * Math.pow(1 + perSecRate, elapsedSec);
    balance = Math.max(0, balance - repayment.amount);
    lastTime = repayment.repaid_at;
  }

  const remainingSec = (now - lastTime) / 1000;
  balance = balance * Math.pow(1 + perSecRate, remainingSec);
  return Math.max(0, balance);
}

export function calculateEntryInterest(
  entry: Entry,
  repayments: Repayment[],
  atTime?: number,
): number {
  const now = atTime ?? Date.now();
  const balance = calculateEntryBalance(entry, repayments, now);
  const totalRepaid = repayments
    .filter((r) => r.repaid_at <= now)
    .reduce((s, r) => s + r.amount, 0);
  return Math.max(0, balance + totalRepaid - entry.principal);
}

export function calculateTotalBalance(
  entries: EntryWithRepayments[],
  atTime?: number,
): number {
  return entries.reduce(
    (sum, e) => sum + calculateEntryBalance(e, e.repayments, atTime),
    0,
  );
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.floor(amount));
}

export function formatCurrencyWithDecimal(amount: number): string {
  if (amount >= 1) {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
  return `¥${amount.toFixed(4)}`;
}

export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

export function rateTypeLabel(rateType: 'annual' | 'monthly' | 'daily'): string {
  switch (rateType) {
    case 'annual': return '年利';
    case 'monthly': return '月利';
    case 'daily': return '日利';
  }
}

export function interestTypeLabel(type: 'simple' | 'compound'): string {
  return type === 'simple' ? '単利' : '複利';
}

/**
 * 返済額が利息・元本にどう充当されるかを計算する（表示用）。
 * 残高計算そのものは repayment_target によらず同一（残高を減らす）。
 *
 * 利息から: まず発生済み利息に充当し、余剰を元本へ
 * 元本から: 全額を元本に充当（利息は引き続き残高に含まれる）
 */
export function getPaymentBreakdown(
  repayment: Repayment,
  entry: Entry,
  priorRepayments: Repayment[],
): PaymentBreakdown {
  if (repayment.repayment_target === 'principal') {
    return { interest_paid: 0, principal_paid: repayment.amount };
  }

  // 返済時点までに発生した利息を計算
  const accruedInterest = calculateEntryInterest(entry, priorRepayments, repayment.repaid_at);
  const interest_paid = Math.min(accruedInterest, repayment.amount);
  const principal_paid = Math.max(0, repayment.amount - interest_paid);
  return { interest_paid, principal_paid };
}
