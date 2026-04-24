function formatJSTDate(d: Date): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(d);
}

export function getJSTYesterday(): string {
  return formatJSTDate(new Date(Date.now() - 24 * 3600 * 1000));
}

export function subtractJSTDay(date: string): string {
  const jstMidnight = new Date(`${date}T00:00:00+09:00`).getTime();
  return formatJSTDate(new Date(jstMidnight - 24 * 3600 * 1000));
}

export function jstDateToRange(date: string): { from: number; to: number } {
  return {
    from: new Date(`${date}T00:00:00+09:00`).getTime(),
    to: new Date(`${date}T23:59:59.999+09:00`).getTime(),
  };
}
