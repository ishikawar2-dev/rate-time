/**
 * サーバーコンポーネントから、現在のリクエストに割り当てられた
 * アクティブ実験 + バリアント ID を取り出すヘルパー。
 *
 * 使い方:
 *   const { experimentId, variantId } = await getExperimentContext();
 *   <AffiliateSection experimentId={experimentId} variantId={variantId} ... />
 *
 * middleware が発行する Cookie `rt_exp_<experimentId>` を読み取り、
 * 現在 active な実験のバリアントに合致する場合のみ値を返す。
 *
 * 注意:
 *   - next/headers に依存するため、middleware (Edge) や client components からは呼べない。
 *   - サーバーコンポーネント / Route Handler 専用。
 *   - cookies() を使うのでページは dynamic rendering になる（静的生成されなくなる）。
 */

import { cookies } from 'next/headers';
import { getActiveExperiment, isValidVariant } from './experiments';

export interface ExperimentContext {
  experimentId?: string;
  variantId?: string;
}

export async function getExperimentContext(): Promise<ExperimentContext> {
  const exp = await getActiveExperiment();
  if (!exp) return {};

  const cookieStore = await cookies();
  const variantId = cookieStore.get(`rt_exp_${exp.id}`)?.value;

  // Cookie が無い、またはコード側の experiments.ts 定義から削除された variant の場合はスキップ
  if (!variantId || !isValidVariant(exp, variantId)) {
    return {};
  }

  return { experimentId: exp.id, variantId };
}
