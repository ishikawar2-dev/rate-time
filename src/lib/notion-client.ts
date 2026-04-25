import { Client, isFullDatabase } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

// database_id → data_source_id の解決結果をプロセス内でキャッシュ
const dataSourceCache = new Map<string, string>();

/**
 * Database ID から最初の Data Source ID を解決する。
 * Notion v5 API では databases.query が廃止され dataSources.query に移行したため、
 * databases.retrieve で data_sources 配列を取得して ID を変換する。
 */
async function resolveDataSourceId(databaseId: string): Promise<string> {
  if (dataSourceCache.has(databaseId)) return dataSourceCache.get(databaseId)!;

  const db = await notion.databases.retrieve({ database_id: databaseId });
  if (!isFullDatabase(db) || db.data_sources.length === 0) {
    throw new Error(`Database ${databaseId} has no data sources`);
  }

  const id = db.data_sources[0].id;
  dataSourceCache.set(databaseId, id);
  return id;
}

export type NotionDailyReportRow = {
  date: string;        // YYYY-MM-DD
  project: string;     // 'rate-time' など
  impressions: number;
  clicks: number;
  ctr: number;         // 0.0833 のような小数（Notion で % として表示される）
  anomalies: number;
  detailUrl: string;
};

/**
 * Notion DB に日次レポート行を upsert する。
 * project + 日付が一致する行があれば更新、なければ新規作成。
 */
export async function upsertDailyReportToNotion(
  databaseId: string,
  row: NotionDailyReportRow,
): Promise<{ pageId: string; created: boolean }> {
  const dataSourceId = await resolveDataSourceId(databaseId);

  const queryResult = await notion.dataSources.query({
    data_source_id: dataSourceId,
    filter: {
      and: [
        { property: 'プロジェクト', select: { equals: row.project } },
        { property: '日付', title: { equals: row.date } },
      ],
    },
  });

  const properties = {
    '日付': { title: [{ text: { content: row.date } }] },
    'プロジェクト': { select: { name: row.project } },
    'インプレッション': { number: row.impressions },
    'クリック': { number: row.clicks },
    'CTR': { number: row.ctr },
    '異常値': { number: row.anomalies },
    '詳細リンク': { url: row.detailUrl },
  };

  if (queryResult.results.length > 0) {
    const existing = queryResult.results[0];
    await notion.pages.update({
      page_id: existing.id,
      properties,
    });
    return { pageId: existing.id, created: false };
  } else {
    const newPage = await notion.pages.create({
      parent: { data_source_id: dataSourceId },
      properties,
    });
    return { pageId: newPage.id, created: true };
  }
}
