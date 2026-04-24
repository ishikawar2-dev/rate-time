/**
 * A/Bテストの実験定義。
 * docs/MONETIZATION.md §4.3 / §4.4 に基づく。
 *
 * 同時実行ルール: 原則として1度に1つのみ `status: 'active'` にする（交互作用を避けるため）。
 * 実験5（timer-default-theme-v1）は Phase 7 でテーマ機能実装後に追加する。
 */

import type { AffiliateCategory } from './affiliates';

export type ExperimentStatus = 'draft' | 'active' | 'paused' | 'completed';

export interface VariantPayload {
  /** 配置位置（タイマー画面） */
  placement?: 'top' | 'bottom' | 'both';
  /** カテゴリの表示順 */
  categoryOrder?: AffiliateCategory[];
  /** カテゴリごとの表示件数 */
  limitByCategory?: Partial<Record<AffiliateCategory, number>>;
  /** このバリアントで表示するカテゴリ */
  enabledCategories?: AffiliateCategory[];
}

export interface VariantConfig {
  id: string;
  name: string;
  /** 割当重み（均等なら全て1） */
  weight: number;
  config: VariantPayload;
}

export interface ExperimentConfig {
  id: string;
  name: string;
  description: string;
  status: ExperimentStatus;
  variants: VariantConfig[];
}

/** 実験定義（Phase 1 時点ではすべて draft） */
export const experiments: ExperimentConfig[] = [
  {
    id: 'timer-placement-v1',
    name: '配置位置テスト',
    description: 'タイマー画面でのアフィリエイトセクション配置位置を上部/下部/両方で比較',
    status: 'draft',
    variants: [
      {
        id: 'timer-placement-v1__control',
        name: 'control',
        weight: 1,
        config: {
          placement: 'bottom',
          categoryOrder: ['debt-consolidation', 'loan-consolidation'],
          limitByCategory: { 'debt-consolidation': 3, 'loan-consolidation': 3 },
        },
      },
      {
        id: 'timer-placement-v1__top',
        name: 'top',
        weight: 1,
        config: {
          placement: 'top',
          categoryOrder: ['debt-consolidation', 'loan-consolidation'],
          limitByCategory: { 'debt-consolidation': 3, 'loan-consolidation': 3 },
        },
      },
      {
        id: 'timer-placement-v1__both',
        name: 'both',
        weight: 1,
        config: {
          placement: 'both',
          categoryOrder: ['debt-consolidation', 'loan-consolidation'],
          limitByCategory: { 'debt-consolidation': 3, 'loan-consolidation': 3 },
        },
      },
    ],
  },
  {
    id: 'timer-category-order-v1',
    name: 'カテゴリ順序テスト',
    description: '債務整理とおまとめローンの表示順を入れ替えて比較（実験1の勝ちバリアント固定後）',
    status: 'draft',
    variants: [
      {
        id: 'timer-category-order-v1__control',
        name: 'control',
        weight: 1,
        config: {
          categoryOrder: ['debt-consolidation', 'loan-consolidation'],
        },
      },
      {
        id: 'timer-category-order-v1__swapped',
        name: 'swapped',
        weight: 1,
        config: {
          categoryOrder: ['loan-consolidation', 'debt-consolidation'],
        },
      },
    ],
  },
  {
    id: 'timer-limit-v1',
    name: '表示件数テスト',
    description: '各カテゴリの表示件数を3件と1件で比較',
    status: 'draft',
    variants: [
      {
        id: 'timer-limit-v1__control',
        name: 'control',
        weight: 1,
        config: {
          limitByCategory: { 'debt-consolidation': 3, 'loan-consolidation': 3 },
        },
      },
      {
        id: 'timer-limit-v1__single',
        name: 'single',
        weight: 1,
        config: {
          limitByCategory: { 'debt-consolidation': 1, 'loan-consolidation': 1 },
        },
      },
    ],
  },
  {
    id: 'timer-category-mix-v1',
    name: 'カテゴリ種類テスト',
    description: '扱うカテゴリの組合せを比較（リスク高のため実験1〜3の後に実施）',
    status: 'draft',
    variants: [
      {
        id: 'timer-category-mix-v1__safe-only',
        name: 'safe-only',
        weight: 1,
        config: {
          enabledCategories: ['debt-consolidation', 'loan-consolidation'],
        },
      },
      {
        id: 'timer-category-mix-v1__with-card-loan',
        name: 'with-card-loan',
        weight: 1,
        config: {
          enabledCategories: ['debt-consolidation', 'loan-consolidation', 'card-loan'],
        },
      },
      {
        id: 'timer-category-mix-v1__with-consumer-finance',
        name: 'with-consumer-finance',
        weight: 1,
        config: {
          enabledCategories: [
            'debt-consolidation',
            'loan-consolidation',
            'consumer-finance',
          ],
        },
      },
      {
        id: 'timer-category-mix-v1__all',
        name: 'all',
        weight: 1,
        config: {
          enabledCategories: [
            'debt-consolidation',
            'loan-consolidation',
            'card-loan',
            'consumer-finance',
            'credit-card',
          ],
        },
      },
    ],
  },
];

/**
 * 現在アクティブな実験を返す。
 * 原則として1つのみアクティブにする運用。複数 active があった場合は最初の1つのみ採用し、警告ログを出す。
 */
export function getActiveExperiment(): ExperimentConfig | null {
  const actives = experiments.filter((e) => e.status === 'active');
  if (actives.length === 0) return null;
  if (actives.length > 1) {
    console.warn(
      `[experiments] multiple active experiments detected: ${actives
        .map((e) => e.id)
        .join(', ')}. Using first one.`,
    );
  }
  return actives[0];
}

/** 指定された variantId が experiment に属する有効なバリアントか検証 */
export function isValidVariant(experiment: ExperimentConfig, variantId: string): boolean {
  return experiment.variants.some((v) => v.id === variantId);
}

/**
 * 決定的ハッシュベースのバリアント割当。
 * 同一 visitorId × 同一 experimentId に対して常に同じ variant を返す。
 */
export function assignVariant(visitorId: string, experiment: ExperimentConfig): string {
  const hash = hashString(`${visitorId}:${experiment.id}`);
  const totalWeight = experiment.variants.reduce((s, v) => s + v.weight, 0);
  if (totalWeight <= 0) return experiment.variants[0].id;
  const bucket = hash % totalWeight;
  let acc = 0;
  for (const v of experiment.variants) {
    acc += v.weight;
    if (bucket < acc) return v.id;
  }
  return experiment.variants[0].id;
}

/** FNV-1a 32bit ハッシュ（Edge Runtime でも動作する純粋な文字列→数値変換） */
function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
