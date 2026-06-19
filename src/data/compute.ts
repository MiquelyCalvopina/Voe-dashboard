import voeData from './voeData.json';

export interface Factor { label: string; value: number; }
export interface Record {
  source: string;
  ciudad: string | null;
  genero: string | null;
  generacion: string | null;
  antiguedad: string | null;
  nivel: string | null;
  area: string | null;
  departamento: string | null;
  score: number;
  cat: string | null;
  comment: string | null;
  tema: string | null;
  subtema: string | null;
  sentimiento: string | null;
  factors: { [k: string]: number };
  exit_comment?: string;
  exit_tema?: string | null;
  exit_sentimiento?: string | null;
}

export const ALL_RECORDS = voeData.records as unknown as Record[];
export const FACTOR_CATALOG = voeData.factorCatalog as { [label: string]: { stage: string; source: string } };
export const FILTER_OPTIONS = voeData.filterOptions as {
  source: string[]; area: string[]; ciudad: string[]; nivel: string[];
  antiguedad: string[]; genero: string[]; generacion: string[];
};

export type Filters = {
  source: string[];
  area: string[];
  ciudad: string[];
  nivel: string[];
  antiguedad: string[];
  genero: string[];
  generacion: string[];
  tema: string[];
  sentimiento: string[];
  exit_tema: string[];
};

export const EMPTY_FILTERS: Filters = {
  source: [], area: [], ciudad: [], nivel: [], antiguedad: [], genero: [], generacion: [], tema: [], sentimiento: [], exit_tema: [],
};

export function applyFilters(records: Record[], f: Filters): Record[] {
  return records.filter(r => {
    if (f.source.length && !f.source.includes(r.source)) return false;
    if (f.area.length && (!r.area || !f.area.includes(r.area))) return false;
    if (f.ciudad.length && (!r.ciudad || !f.ciudad.includes(r.ciudad))) return false;
    if (f.nivel.length && (!r.nivel || !f.nivel.includes(r.nivel))) return false;
    if (f.antiguedad.length && (!r.antiguedad || !f.antiguedad.includes(r.antiguedad))) return false;
    if (f.genero.length && (!r.genero || !f.genero.includes(r.genero))) return false;
    if (f.generacion.length && (!r.generacion || !f.generacion.includes(r.generacion))) return false;
    if (f.tema.length && (!r.tema || !f.tema.includes(r.tema))) return false;
    if (f.sentimiento.length && (!r.sentimiento || !f.sentimiento.includes(r.sentimiento))) return false;
    if (f.exit_tema.length && (!r.exit_tema || !f.exit_tema.includes(r.exit_tema))) return false;
    return true;
  });
}

export interface EnpsStats {
  total: number; enps: number;
  promoters: number; neutrals: number; detractors: number;
  pct_promoters: number; pct_neutrals: number; pct_detractors: number;
}

export function enpsStats(records: Record[]): EnpsStats {
  const total = records.length;
  if (!total) return { total: 0, enps: 0, promoters: 0, neutrals: 0, detractors: 0, pct_promoters: 0, pct_neutrals: 0, pct_detractors: 0 };
  const promoters = records.filter(r => r.score >= 9).length;
  const detractors = records.filter(r => r.score <= 6).length;
  const neutrals = total - promoters - detractors;
  return {
    total,
    enps: Math.round((promoters / total - detractors / total) * 100),
    promoters, neutrals, detractors,
    pct_promoters: Math.round((promoters / total) * 1000) / 10,
    pct_neutrals: Math.round((neutrals / total) * 1000) / 10,
    pct_detractors: Math.round((detractors / total) * 1000) / 10,
  };
}

export function enpsStatus(enps: number): { label: string; color: string; bg: string } {
  if (enps >= 76) return { label: 'Excelente', color: '#389e0d', bg: '#f6ffed' };
  if (enps >= 31) return { label: 'Bueno', color: '#1677ff', bg: '#e6f4ff' };
  if (enps >= 0) return { label: 'Regular', color: '#faad14', bg: '#fffbe6' };
  return { label: 'Crítico', color: '#ff4d4f', bg: '#fff1f0' };
}

function countBy(records: Record[], key: keyof Record): { label: string; count: number }[] {
  const m = new Map<string, number>();
  for (const r of records) {
    const v = r[key] as string | null;
    if (v) m.set(v, (m.get(v) || 0) + 1);
  }
  return [...m.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
}

export function themeCounts(records: Record[]) {
  return countBy(records.filter(r => r.comment), 'tema').map(x => ({ tema: x.label, count: x.count }));
}

export function sentimentCounts(records: Record[]) {
  return countBy(records.filter(r => r.comment), 'sentimiento').map(x => ({ sentimiento: x.label, count: x.count }));
}

export function demographic(records: Record[], key: keyof Record) {
  return countBy(records, key).map(x => ({ label: x.label, value: x.count }));
}

export function factorAverages(records: Record[]): { label: string; score: number; stage: string }[] {
  const sums = new Map<string, { sum: number; n: number }>();
  for (const r of records) {
    for (const [label, val] of Object.entries(r.factors)) {
      const cur = sums.get(label) || { sum: 0, n: 0 };
      cur.sum += val; cur.n += 1;
      sums.set(label, cur);
    }
  }
  return [...sums.entries()].map(([label, { sum, n }]) => ({
    label,
    score: Math.round((sum / n) * 100) / 100,
    stage: FACTOR_CATALOG[label]?.stage || 'Otros',
  }));
}

export function comments(records: Record[]) {
  return records.filter(r => r.comment).map(r => ({
    source: r.source, comment: r.comment!, tema: r.tema, subtema: r.subtema,
    sentimiento: r.sentimiento, area: r.area, cat: r.cat,
  }));
}

export function exitThemes(records: Record[]) {
  const m = new Map<string, number>();
  for (const r of records) {
    if (r.exit_comment && r.exit_tema) m.set(r.exit_tema, (m.get(r.exit_tema) || 0) + 1);
  }
  return [...m.entries()].map(([tema, count]) => ({ tema, count })).sort((a, b) => b.count - a.count);
}

export function exitComments(records: Record[]) {
  return records.filter(r => r.exit_comment).map(r => ({
    comment: r.exit_comment!, tema: r.exit_tema, sentimiento: r.exit_sentimiento, area: r.area, cat: r.cat,
  }));
}
