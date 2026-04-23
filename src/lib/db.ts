import { neon } from '@neondatabase/serverless';
import type { NeonQueryFunction } from '@neondatabase/serverless';
import type { Timer, Entry, Repayment, EntryWithRepayments } from './interest';

// リクエスト時まで接続を遅延させる（ビルド時に DATABASE_URL が不要になる）
let _sql: NeonQueryFunction<false, false> | null = null;
function getSql(): NeonQueryFunction<false, false> {
  if (!_sql) _sql = neon(process.env.DATABASE_URL!) as NeonQueryFunction<false, false>;
  return _sql;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

function toTimer(r: Row): Timer {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name ?? null,
    created_at: Number(r.created_at),
  };
}

function toEntry(r: Row): Entry {
  return {
    id: r.id,
    timer_id: r.timer_id,
    name: r.name ?? null,
    principal: Number(r.principal),
    interest_rate: Number(r.interest_rate),
    rate_type: r.rate_type as 'annual' | 'monthly' | 'daily',
    interest_type: r.interest_type as 'simple' | 'compound',
    started_at: Number(r.started_at),
    created_at: Number(r.created_at),
  };
}

function toRepayment(r: Row): Repayment {
  return {
    id: r.id,
    entry_id: r.entry_id,
    amount: Number(r.amount),
    item_name: r.item_name ?? null,
    note: r.note ?? null,
    repayment_target: (r.repayment_target ?? 'interest') as 'interest' | 'principal',
    repaid_at: Number(r.repaid_at),
    created_at: Number(r.created_at),
  };
}

export async function getTimerBySlug(slug: string): Promise<Timer | null> {
  const rows = await getSql()`SELECT * FROM timers WHERE slug = ${slug}`;
  return rows.length ? toTimer(rows[0]) : null;
}

export async function getEntriesByTimerId(timerId: string): Promise<Entry[]> {
  const rows = await getSql()`SELECT * FROM entries WHERE timer_id = ${timerId} ORDER BY started_at ASC`;
  return rows.map(toEntry);
}

export async function getRepaymentsByEntryId(entryId: string): Promise<Repayment[]> {
  const rows = await getSql()`SELECT * FROM repayments WHERE entry_id = ${entryId} ORDER BY repaid_at ASC`;
  return rows.map(toRepayment);
}

export async function getEntryById(entryId: string): Promise<Entry | null> {
  const rows = await getSql()`SELECT * FROM entries WHERE id = ${entryId}`;
  return rows.length ? toEntry(rows[0]) : null;
}

export async function getTimerWithEntries(
  slug: string,
): Promise<(Timer & { entries: EntryWithRepayments[] }) | null> {
  const timer = await getTimerBySlug(slug);
  if (!timer) return null;

  const entries = await getEntriesByTimerId(timer.id);
  const entriesWithRepayments: EntryWithRepayments[] = await Promise.all(
    entries.map(async (e) => ({
      ...e,
      repayments: await getRepaymentsByEntryId(e.id),
    })),
  );

  return { ...timer, entries: entriesWithRepayments };
}

export async function createTimer(
  timer: Timer,
  entries: Omit<Entry, 'id' | 'timer_id' | 'created_at'>[],
  entryIdGen: () => string,
): Promise<Timer & { entries: EntryWithRepayments[] }> {
  const now = Date.now();

  const entryData = entries.map((e) => ({
    id: entryIdGen(),
    timer_id: timer.id,
    name: e.name,
    principal: e.principal,
    interest_rate: e.interest_rate,
    rate_type: e.rate_type,
    interest_type: e.interest_type,
    started_at: e.started_at,
    created_at: now,
  }));

  const sql = getSql();
  await sql.transaction([
    sql`INSERT INTO timers (id, slug, name, created_at)
        VALUES (${timer.id}, ${timer.slug}, ${timer.name}, ${timer.created_at})`,
    ...entryData.map(
      (e) =>
        sql`INSERT INTO entries (id, timer_id, name, principal, interest_rate, rate_type, interest_type, started_at, created_at)
            VALUES (${e.id}, ${e.timer_id}, ${e.name}, ${e.principal}, ${e.interest_rate}, ${e.rate_type}, ${e.interest_type}, ${e.started_at}, ${e.created_at})`,
    ),
  ]);

  return {
    ...timer,
    entries: entryData.map((e) => ({ ...e, repayments: [] })),
  };
}

export async function addEntry(entry: Entry): Promise<Entry> {
  await getSql()`
    INSERT INTO entries (id, timer_id, name, principal, interest_rate, rate_type, interest_type, started_at, created_at)
    VALUES (${entry.id}, ${entry.timer_id}, ${entry.name}, ${entry.principal}, ${entry.interest_rate}, ${entry.rate_type}, ${entry.interest_type}, ${entry.started_at}, ${entry.created_at})
  `;
  const rows = await getSql()`SELECT * FROM entries WHERE id = ${entry.id}`;
  return toEntry(rows[0]);
}

export async function createRepayment(repayment: Repayment): Promise<Repayment> {
  await getSql()`
    INSERT INTO repayments (id, entry_id, amount, item_name, note, repayment_target, repaid_at, created_at)
    VALUES (${repayment.id}, ${repayment.entry_id}, ${repayment.amount}, ${repayment.item_name}, ${repayment.note}, ${repayment.repayment_target}, ${repayment.repaid_at}, ${repayment.created_at})
  `;
  const rows = await getSql()`SELECT * FROM repayments WHERE id = ${repayment.id}`;
  return toRepayment(rows[0]);
}
