/**
 * A/Bテストの実験定義と割当ロジック。
 * docs/MONETIZATION.md §4.3 / §4.4 / §4.5 に基づく。
 *
 * このファイルは実験の「設計図」:
 *   - 実験のID、説明、variants（id / name / weight / config）
 *   - バリアント割当アルゴリズム
 *
 * 運用状態（status / started_at / ended_at）は DB が唯一の真実。
 * 管理画面 /admin/experiments から操作され、middleware は DB を参照する。
 *
 * 同時実行ルール: 原則として1度に1つのみ status='active'（交互作用を避ける）。
 */

import type { AffiliateCategory } from './affiliates';
import { getSql } from './db';

export type ExperimentStatus = 'draft' | 'active' | 'paused' | 'completed';

export interface VariantPayload {
  placement?: 'top' | 'bottom' | 'both';
  categoryOrder?: AffiliateCategory[];
  limitByCategory?: Partial<Record<AffiliateCategory, number>>;
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
  variants: VariantConfig[];
}

/** 実験の構造定義。status は DB 側に持つため、ここには含めない。 */
export const experiments: ExperimentConfig[] = [
  {
    id: 'timer-placement-v1',
    name: '配置位置テスト',
    description: 'タイマー画面でのアフィリエイトセクション配置位置を上部/下部/両方で比較',
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
    variants: [
      {
        id: 'timer-category-order-v1__control',
        name: 'control',
        weight: 1,
        config: { categoryOrder: ['debt-consolidation', 'loan-consolidation'] },
      },
      {
        id: 'timer-category-order-v1__swapped',
        name: 'swapped',
        weight: 1,
        config: { categoryOrder: ['loan-consolidation', 'debt-consolidation'] },
      },
    ],
  },
  {
    id: 'timer-limit-v1',
    name: '表示件数テスト',
    description: '各カテゴリの表示件数を3件と1件で比較',
    variants: [
      {
        id: 'timer-limit-v1__control',
        name: 'control',
        weight: 1,
        config: { limitByCategory: { 'debt-consolidation': 3, 'loan-consolidation': 3 } },
      },
      {
        id: 'timer-limit-v1__single',
        name: 'single',
        weight: 1,
        config: { limitByCategory: { 'debt-consolidation': 1, 'loan-consolidation': 1 } },
      },
    ],
  },
  {
    id: 'timer-category-mix-v1',
    name: 'カテゴリ種類テスト',
    description: '扱うカテゴリの組合せを比較（リスク高のため実験1〜3の後に実施）',
    variants: [
      {
        id: 'timer-category-mix-v1__safe-only',
        name: 'safe-only',
        weight: 1,
        config: { enabledCategories: ['debt-consolidation', 'loan-consolidation'] },
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

/** コード側の設計図から experiment を引く */
export function getExperimentById(id: string): ExperimentConfig | null {
  return experiments.find((e) => e.id === id) ?? null;
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

// ─── アクティブ実験の取得（DB + インメモリキャッシュ）──────────────────

const CACHE_TTL_MS = 30_000;
let activeCache: { exp: ExperimentConfig | null; fetchedAt: number } | null = null;

/** 主にテスト・管理画面の mutation 後に明示的に失効させたいとき用 */
export function invalidateActiveExperimentCache(): void {
  activeCache = null;
}

/**
 * 現在 status='active' な実験を返す。
 *
 * DB を source of truth とし、モジュールスコープの 30 秒 TTL キャッシュを挟む。
 * 管理画面から status を変更した場合、最大 30 秒でインスタンスに反映される。
 * DB 到達不能時はフェイルオープン（null を返し、バリアント割当を行わない）。
 */
export async function getActiveExperiment(): Promise<ExperimentConfig | null> {
  const now = Date.now();
  if (activeCache && now - activeCache.fetchedAt < CACHE_TTL_MS) {
    return activeCache.exp;
  }

  let exp: ExperimentConfig | null = null;
  try {
    const rows = await getSql()`
      SELECT id FROM experiments WHERE status = 'active' ORDER BY id LIMIT 2
    `;
    if (rows.length >= 2) {
      console.warn(
        `[experiments] multiple active experiments in DB: ${rows
          .map((r) => r.id)
          .join(', ')}. Using first.`,
      );
    }
    if (rows.length >= 1) {
      const dbId = rows[0].id as string;
      exp = getExperimentById(dbId);
      if (!exp) {
        console.warn(
          `[experiments] DB has active experiment '${dbId}' but no matching config in experiments.ts`,
        );
      }
    }
  } catch (err) {
    console.error('[experiments] failed to load active experiment from DB:', err);
    exp = null;
  }

  activeCache = { exp, fetchedAt: now };
  return exp;
}
