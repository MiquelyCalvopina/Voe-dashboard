import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
  ComposedChart, Line, AreaChart, Area,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, Button, Pagination } from 'antd';
import {
  ALL_RECORDS, FILTER_OPTIONS, EMPTY_FILTERS, applyFilters, enpsStats, enpsStatus,
  factorAverages, comments, exitThemes, exitComments, stageTopTwoBox,
  type Filters,
} from '../data/compute';

// ── Design tokens ─────────────────────────────────────────────────────────────
const GAP = 24;
const C = {
  promoter: '#52c41a',
  neutral: '#faad14',
  detractor: '#ff4d4f',
  primary: '#1677ff',
  purple: '#722ed1',
  pink: '#eb2f96',
  cyan: '#13c2c2',
  orange: '#fa8c16',
  ink: '#1a1a2e',
  muted: '#8c8c8c',
  bar: '#94a3b8',
  barLight: '#cbd5e1',
};
const ENPS_COLORS: Record<string, string> = { 'Promotor': '#52c41a', 'Neutro': '#faad14', 'Detractor': '#ff4d4f' };
const PALETTE = [C.primary, C.promoter, C.pink, C.orange, C.purple, C.cyan, C.detractor, '#a0d911'];

const trunc = (s: string, n = 45) => (s.length > n ? s.slice(0, n) + '…' : s);

// ── Reusable UI ───────────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: C.ink, margin: 0 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 12, color: C.muted, margin: '3px 0 0' }}>{subtitle}</p>}
    </div>
  );
}

function Card({ children, delay = 0, style = {}, pad = 17 }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties; pad?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay }}
      style={{ backgroundColor: '#fff', borderRadius: 12, padding: pad, border: '1px solid #e8e8e8', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', minWidth: 0, ...style }}
    >{children}</motion.div>
  );
}

function CardTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>{title}</div>
      {sub && <div style={{ fontSize: 10.5, color: C.muted, marginTop: 1 }}>{sub}</div>}
    </div>
  );
}

function ProgressBar({ pct, color, delay = 0, h = 5 }: { pct: number; color: string; delay?: number; h?: number }) {
  return (
    <div style={{ height: h, backgroundColor: '#f0f0f0', borderRadius: 1000, overflow: 'hidden' }}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, delay, ease: 'easeOut' }}
        style={{ height: '100%', backgroundColor: color, borderRadius: 1000 }} />
    </div>
  );
}

const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 11 }}>
      {label != null && <p style={{ fontWeight: 700, marginBottom: 4, color: C.ink }}>{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.fill || p.color, margin: '2px 0' }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

// ── Journey stage config ──────────────────────────────────────────────────────
const STAGES = [
  { key: 'Selección', label: 'Selección & Contratación', icon: '🎯', color: C.primary, sources: ['0-6 Meses'] },
  { key: 'Onboarding', label: 'Onboarding', icon: '🚀', color: C.cyan, sources: ['0-6 Meses'] },
  { key: 'Día a Día', label: 'Día a Día', icon: '💼', color: C.purple, sources: ['+6 Meses'] },
  { key: 'Desarrollo', label: 'Desarrollo', icon: '📈', color: C.orange, sources: ['+6 Meses'] },
  { key: 'Salida', label: 'Permanencia & Salida', icon: '🔄', color: C.pink, sources: ['Ex Colaboradores'] },
] as const;

const SOURCE_TO_ANT: Record<string, string> = {
  '0-6 Meses': 'Menos de 6 meses',
  '+6 Meses': 'Mas de 6 meses',
  'Ex Colaboradores': 'Ex colaborador',
};

const COMMENTS_PER_PAGE = 25;

// Orden lógico del ciclo de vida: menos de 6 meses → más de 6 meses → ex colaboradores
const SOURCE_ORDER = ['0-6 Meses', '+6 Meses', 'Ex Colaboradores'];
const sourceRank = (s: string) => { const i = SOURCE_ORDER.indexOf(s); return i === -1 ? 99 : i; };

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [commentPage, setCommentPage] = useState(1);
  const [exitCommentPage, setExitCommentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(true);

  const records = useMemo(() => applyFilters(ALL_RECORDS, filters), [filters]);

  const stats = useMemo(() => enpsStats(records), [records]);
  const byType = useMemo(() =>
    [...FILTER_OPTIONS.source].sort((a, b) => sourceRank(a) - sourceRank(b)).map(src => {
      const s = enpsStats(records.filter(r => r.source === src));
      return { type: src, ant: SOURCE_TO_ANT[src], label: src === 'Ex Colaboradores' ? 'Ex Colab.' : src, ...s };
    }).filter(d => d.total > 0)
  , [records]);

  const expRecords = useMemo(() => records.filter(r => r.source !== 'Ex Colaboradores'), [records]);
  const allFactors = useMemo(() => factorAverages(records), [records]);
  const cmts = useMemo(() => comments(expRecords), [expRecords]);
  const exThemes = useMemo(() => exitThemes(records), [records]);
  const exCmts = useMemo(() => exitComments(records), [records]);

  const reliableFactors = allFactors.filter(f => f.gap !== null);
  const scores = reliableFactors.map(f => f.score).sort((a, b) => a - b);
  const median = scores.length ? scores[Math.floor(scores.length / 2)] : 3.75;
  const top5 = reliableFactors.filter(f => f.score >= median).sort((a, b) => (b.gap ?? 0) - (a.gap ?? 0)).slice(0, 5);
  const bottom5 = reliableFactors.filter(f => f.score < median).sort((a, b) => (b.gap ?? 0) - (a.gap ?? 0)).slice(0, 5);

  const journey = useMemo(() => STAGES.map(stage => {
    const stageFactors = allFactors.filter(f => f.stage === stage.key);
    const avg = stageFactors.length ? stageFactors.reduce((a, b) => a + b.score, 0) / stageFactors.length : 0;
    const stageRecords = records.filter(r => (stage.sources as readonly string[]).includes(r.source));
    const s = enpsStats(stageRecords);
    const best = [...stageFactors].sort((a, b) => b.score - a.score)[0];
    const worst = [...stageFactors].sort((a, b) => a.score - b.score)[0];
    return {
      ...stage, avg: Math.round(avg * 100) / 100, satisfaction: stageTopTwoBox(records, stage.key),
      enps: s.enps, n: s.total, best, worst,
    };
  }).filter(j => j.n > 0), [records, allFactors]);

  const exStats = useMemo(() => enpsStats(records.filter(r => r.source === 'Ex Colaboradores')), [records]);
  const exFactors = allFactors.filter(f => f.stage === 'Salida');

  const activeFilterCount = Object.values(filters).reduce((a, arr) => a + arr.length, 0);
  const toggleFilter = (key: keyof Filters, value: string) => {
    setFilters(prev => {
      const arr = prev[key];
      return { ...prev, [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });
  };
  const setFilter = (key: keyof Filters, vals: string[]) => {
    setFilters(prev => ({ ...prev, [key]: vals }));
    setCommentPage(1);
    setExitCommentPage(1);
  };

  const status = enpsStatus(stats.enps);
  const donutData = [
    { name: 'Promotores', value: stats.promoters, color: C.promoter },
    { name: 'Neutros', value: stats.neutrals, color: C.neutral },
    { name: 'Detractores', value: stats.detractors, color: C.detractor },
  ];

  const pagedComments = cmts.slice((commentPage - 1) * COMMENTS_PER_PAGE, commentPage * COMMENTS_PER_PAGE);
  const pagedExitComments = exCmts.slice((exitCommentPage - 1) * COMMENTS_PER_PAGE, exitCommentPage * COMMENTS_PER_PAGE);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      {/* ═══ HEADER FLOTANTE ═══ */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        padding: '16px 24px 0',
      }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: C.ink, margin: 0, letterSpacing: '-0.2px', lineHeight: 1.3 }}>
          Voz del Colaborador · Mutualista Pichincha
        </h1>
        <p style={{ fontSize: 11.5, color: C.muted, margin: '2px 0 12px' }}>
          ¿Cómo es la experiencia del colaborador durante su ciclo de vida y cuáles son los principales impulsores de satisfacción y riesgo de salida?
        </p>

        {/* Fila de filtros colapsable */}
        <motion.div
          initial={false}
          animate={{ height: filtersOpen ? 'auto' : 0, opacity: filtersOpen ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ overflow: 'hidden' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 14 }}>
            {/* Icono + label Filtros */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M3 4h18l-7 8v6l-4 2v-8L3 4z" fill={C.primary} />
              </svg>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.ink }}>Filtros</span>
            </div>
            <div style={{ width: 1, height: 16, background: '#e0e0e0', flexShrink: 0 }} />
            {/* Selects individualmente bordeados */}
            {([
              ['area', 'Área...', FILTER_OPTIONS.area],
              ['ciudad', 'Ciudad...', FILTER_OPTIONS.ciudad],
              ['nivel', 'Cargo...', FILTER_OPTIONS.nivel],
              ['antiguedad', 'Antigüedad...', FILTER_OPTIONS.antiguedad],
              ['genero', 'Género...', FILTER_OPTIONS.genero],
            ] as [keyof Filters, string, string[]][]).map(([key, label, opts]) => (
              <Select
                key={key}
                mode="multiple"
                maxTagCount={0}
                maxTagPlaceholder={(o) => `${o.length} sel.`}
                allowClear
                variant="outlined"
                size="small"
                placeholder={label}
                value={filters[key]}
                onChange={(vals) => setFilter(key, vals as string[])}
                options={opts.map(o => ({ value: o, label: o }))}
                style={{ flex: 1, minWidth: 110 }}
                styles={{ popup: { root: { borderRadius: 8 } } }}
              />
            ))}
            {activeFilterCount > 0 && (
              <Button size="small" type="text" onClick={() => setFilters(EMPTY_FILTERS)}
                style={{ fontSize: 11, color: C.detractor, flexShrink: 0, padding: '0 6px' }}>
                Limpiar
              </Button>
            )}
          </div>
        </motion.div>

        {/* Botón collapse pegado al borde derecho */}
        <button
          onClick={() => setFiltersOpen(o => !o)}
          style={{
            position: 'absolute', top: 14, right: 20,
            width: 28, height: 28, borderRadius: '50%',
            border: '1px solid #e8e8e8', background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 12, color: C.muted,
            transform: filtersOpen ? 'rotate(0deg)' : 'rotate(180deg)',
            transition: 'transform 0.2s',
          }}
          aria-label={filtersOpen ? 'Colapsar filtros' : 'Expandir filtros'}
        >
          ↑
        </button>
      </div>

      {/* ═══ CONTENIDO ═══ */}
      <div style={{ padding: `${GAP}px ${GAP}px 40px`, display: 'flex', flexDirection: 'column', gap: GAP }}>

      {/* ═══ KPI ROW ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.7fr 1.4fr', gap: GAP }}>

        {/* Total participantes */}
        <Card delay={0}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.ink, marginBottom: 2 }}>Total participantes</div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>Respuestas analizadas</div>
          <div style={{ fontSize: 40, fontWeight: 800, color: C.ink, lineHeight: 1.05, marginBottom: 12 }}>{stats.total}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {byType.map((d) => (
              <div key={d.type} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
                <span style={{ color: C.muted }}>{d.label}</span>
                <span style={{ fontWeight: 700, color: C.ink }}>{d.total}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* eNPS consolidado */}
        <Card delay={0.06}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>eNPS · Net Promoter Score</span>
            <span style={{ padding: '2px 10px', borderRadius: 1000, fontSize: 11, fontWeight: 700, color: status.color, background: status.bg, border: `1px solid ${status.color}40` }}>
              {status.label}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6, fontSize: 10.5, color: C.muted, marginBottom: 14 }}>
            <span>Crítico: -100 a 0</span><span>·</span><span>Regular: 1 a 30</span><span>·</span><span>Bueno: 31 a 75</span><span>·</span><span>Excelente: 76+</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flexShrink: 0 }}>
              <div style={{ fontSize: 44, fontWeight: 800, color: C.ink, lineHeight: 1, marginBottom: 12 }}>
                {stats.enps}<span style={{ fontSize: 18, color: '#d9d9d9', fontWeight: 400 }}>/100</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {donutData.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0, display: 'inline-block' }} />
                    <span style={{ color: C.muted, width: 82 }}>{d.name}</span>
                    <span style={{ fontWeight: 700, color: d.color }}>
                      {stats.total ? Math.round((d.value / stats.total) * 1000) / 10 : 0}%
                    </span>
                    <span style={{ color: '#bfbfbf', fontSize: 10 }}>({d.value})</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0, height: 114, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                    innerRadius={38} outerRadius={50} paddingAngle={2} cornerRadius={3}
                    startAngle={90} endAngle={-270}>
                    {donutData.map((d, i) => <Cell key={i} fill={d.color} stroke="none" />)}
                  </Pie>
                  <Tooltip content={<ChartTip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* eNPS por Antigüedad */}
        <Card delay={0.12}>
          <CardTitle title="eNPS por Antigüedad" sub="Click en una barra para filtrar el reporte" />
          <ResponsiveContainer width="100%" height={175}>
            <ComposedChart data={byType} margin={{ top: 20, right: 40, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10.5, fill: '#595959' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" domain={[0, 100]} tick={{ fontSize: 9, fill: '#bfbfbf' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <YAxis yAxisId="right" orientation="right" domain={[-100, 100]} tick={false} axisLine={false} tickLine={false} width={0} />
              <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
              <Bar yAxisId="left" dataKey="pct_promoters" name="Promotores %" stackId="dist" fill={C.promoter} maxBarSize={56} cursor="pointer"
                onClick={(d: any) => toggleFilter('antiguedad', d.ant)}>
                {byType.map((d, i) => (
                  <Cell key={i} fill={C.promoter} opacity={filters.antiguedad.length && !filters.antiguedad.includes(d.ant) ? 0.3 : 1} />
                ))}
              </Bar>
              <Bar yAxisId="left" dataKey="pct_neutrals" name="Neutros %" stackId="dist" fill={C.neutral} maxBarSize={56} cursor="pointer"
                onClick={(d: any) => toggleFilter('antiguedad', d.ant)}>
                {byType.map((d, i) => (
                  <Cell key={i} fill={C.neutral} opacity={filters.antiguedad.length && !filters.antiguedad.includes(d.ant) ? 0.3 : 1} />
                ))}
              </Bar>
              <Bar yAxisId="left" dataKey="pct_detractors" name="Detractores %" stackId="dist" fill={C.detractor} maxBarSize={56} cursor="pointer"
                onClick={(d: any) => toggleFilter('antiguedad', d.ant)}>
                {byType.map((d, i) => (
                  <Cell key={i} fill={C.detractor} opacity={filters.antiguedad.length && !filters.antiguedad.includes(d.ant) ? 0.3 : 1} />
                ))}
              </Bar>
              <Line yAxisId="right" type="monotone" dataKey="enps" name="eNPS" stroke={C.primary} strokeWidth={2.5}
                dot={{ fill: C.primary, r: 4, strokeWidth: 0 }}
                label={{ position: 'top', fontSize: 11, fontWeight: 800, fill: C.primary, formatter: (v: any) => v }} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ═══ SECCIÓN: JOURNEY ═══ */}
      <section>
        <SectionHeader title="El Viaje del Colaborador" subtitle="% de colaboradores satisfechos (calificación 4-5) en cada etapa del ciclo de vida" />
        <Card delay={0} pad={20}>
          <div style={{ height: 96 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={journey} margin={{ top: 26, right: 24, left: 24, bottom: 0 }}>
                <defs>
                  <linearGradient id="journeyFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.primary} stopOpacity={0.16} />
                    <stop offset="100%" stopColor={C.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={false} axisLine={false} tickLine={false} height={0} />
                <YAxis domain={[45, 85]} hide />
                <Tooltip content={({ active, payload }: any) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 11 }}>
                      <p style={{ fontWeight: 700, color: C.ink, margin: 0 }}>{d.label}</p>
                      <p style={{ color: C.muted, margin: '2px 0 0' }}>Satisfechos (4-5): {d.satisfaction}% · eNPS {d.enps}</p>
                    </div>
                  );
                }} />
                <Area type="monotone" dataKey="satisfaction" stroke={C.primary} strokeWidth={2.5}
                  fill="url(#journeyFill)"
                  dot={{ r: 4.5, fill: '#fff', stroke: C.primary, strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: C.primary }}
                  label={{ position: 'top', fontSize: 11.5, fontWeight: 700, fill: C.ink, formatter: (v: any) => `${v}%` }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${journey.length}, 1fr)`, borderTop: '1px solid #f0f0f0', marginTop: 4 }}>
            {journey.map((j, i) => (
              <motion.div key={j.key}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 + i * 0.06 }}
                style={{ padding: '16px 14px', position: 'relative' }}>
                {/* Chevron separador entre columnas */}
                {i < journey.length - 1 && (
                  <span style={{ position: 'absolute', top: 64, right: -7, color: '#d9d9d9', fontSize: 16, lineHeight: 1, zIndex: 1 }}>›</span>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginBottom: 8 }}>
                  <span style={{ width: 24, height: 24, borderRadius: 7, background: j.color + '1f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>{j.icon}</span>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.ink, lineHeight: 1.2 }}>{j.label}</div>
                </div>
                <div style={{ fontSize: 30, fontWeight: 800, color: C.ink, lineHeight: 1, marginBottom: 12, textAlign: 'center' }}>{j.satisfaction}%</div>
                {j.best && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 9.5, color: C.promoter, fontWeight: 700, marginBottom: 2 }}>▲ Fortaleza</div>
                    <div style={{ fontSize: 9.5, color: '#595959', lineHeight: 1.3 }} title={j.best.label}>{trunc(j.best.label, 40)}</div>
                  </div>
                )}
                {j.worst && j.worst.label !== j.best?.label && (
                  <div>
                    <div style={{ fontSize: 9.5, color: C.detractor, fontWeight: 700, marginBottom: 2 }}>▼ A mejorar</div>
                    <div style={{ fontSize: 9.5, color: '#595959', lineHeight: 1.3 }} title={j.worst.label}>{trunc(j.worst.label, 40)}</div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </Card>
      </section>

      {/* ═══ SECCIÓN: VOZ DEL COLABORADOR ═══ */}
      <section>
        <SectionHeader title="Voz del Colaborador" subtitle="Qué dicen los colaboradores activos en sus comentarios" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: GAP, alignItems: 'stretch' }}>

          {/* Columna izquierda: Top 5 listas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
            <Card delay={0.04}>
              <CardTitle title="Top 5 Fortalezas" sub="Factores mejor evaluados" />
              <FactorList items={top5} color={C.promoter} bg="#f6ffed" />
            </Card>
            <Card delay={0.08}>
              <CardTitle title="Top 5 Áreas a Mejorar" sub="Factores con menor evaluación" />
              <FactorList items={bottom5} color={C.detractor} bg="#fff1f0" dim />
            </Card>
          </div>

          {/* Columna derecha: Comentarios */}
          <CommentTable
            comments={pagedComments.map(c => c.comment)}
            totalCount={cmts.length}
            page={commentPage}
            onPage={setCommentPage}
            delay={0.1}
          />
        </div>
      </section>

      {/* ═══ SECCIÓN: EX COLABORADORES ═══ */}
      {exStats.total > 0 && (
        <section>
          <SectionHeader title="Ex Colaboradores · Proceso de Salida" subtitle="Qué se llevaron al salir y qué pudo evitar su desvinculación" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: GAP, alignItems: 'stretch' }}>

            {/* Columna izquierda: Satisfacción + ¿Cómo evitar? */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
              <Card delay={0.04}>
                <CardTitle title="Satisfacción con el Proceso de Salida" sub="Qué tan satisfechos quedaron con cada paso de su salida (1 = muy insatisfecho, 5 = muy satisfecho)" />
                <FactorList items={[...exFactors].sort((a, b) => b.score - a.score)} color={C.bar} bg="#f1f5f9" valueScale />
              </Card>
              {exThemes.length > 0 && (
                <Card delay={0.08}>
                  <CardTitle title="¿Cómo evitar la desvinculación?" sub="Lo que pudo retenerlos, según sus respuestas, de más a menos frecuente" />
                  <RankedBars
                    items={exThemes.map(t => ({ label: t.tema, value: t.count }))}
                    total={exThemes.reduce((a, t) => a + t.count, 0)}
                    demoteLast={['Ninguna', 'Otros']}
                  />
                </Card>
              )}
            </div>

            {/* Columna derecha: Comentarios de salida */}
            <CommentTable
              comments={pagedExitComments.map(c => c.comment)}
              totalCount={exCmts.length}
              page={exitCommentPage}
              onPage={setExitCommentPage}
              delay={0.1}
            />
          </div>
        </section>
      )}
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function CommentTable({ comments, totalCount, page, onPage, delay = 0 }: {
  comments: string[];
  totalCount: number;
  page: number;
  onPage: (p: number) => void;
  delay?: number;
}) {
  const from = totalCount ? (page - 1) * COMMENTS_PER_PAGE + 1 : 0;
  const to = Math.min(page * COMMENTS_PER_PAGE, totalCount);
  return (
    <div style={{ position: 'relative', minWidth: 0 }}>
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay }}
      style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0 }}
    >
      {/* Encabezado: conteo + paginación numerada */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: C.muted }}>
          {from}–{to} de {totalCount.toLocaleString('es')} comentarios
        </span>
        <Pagination
          current={page}
          total={totalCount}
          pageSize={COMMENTS_PER_PAGE}
          onChange={onPage}
          size="small"
          showSizeChanger={false}
        />
      </div>

      {/* Tabla con scroll interno */}
      <div style={{
        flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
        border: '1px solid #e8e8e8', borderRadius: 8, overflow: 'hidden', background: '#fff',
      }}>
        {/* Cabecera */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '11px 16px', background: '#fafafa', borderBottom: '1px solid #e8e8e8',
          fontSize: 12.5, fontWeight: 600, color: C.ink, flexShrink: 0,
        }}>
          Comentario
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M5 6.5L7.5 3.5L10 6.5" stroke="#bfbfbf" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 9.5L7.5 12.5L10 9.5" stroke="#bfbfbf" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {/* Cuerpo scrolleable */}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          {comments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#bfbfbf', fontSize: 12 }}>Sin comentarios</div>
          ) : (
            <AnimatePresence mode="wait">
              {comments.map((c, i) => (
                <motion.div key={`${page}-${i}`}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.006 }}
                  style={{
                    padding: '11px 16px', borderBottom: i < comments.length - 1 ? '1px solid #f0f0f0' : 'none',
                    fontSize: 12, color: '#595959', lineHeight: 1.5,
                  }}>
                  {c}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
    </div>
  );
}


function FactorList({ items, color, bg, dim, valueScale }: { items: { label: string; score: number }[]; color: string; bg: string; dim?: boolean; valueScale?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {items.map((f, i) => (
        <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          {!valueScale && (
            <div style={{ width: 19, height: 19, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9.5, fontWeight: 700, color, flexShrink: 0 }}>{i + 1}</div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: '#595959', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }} title={f.label}>{f.label}</div>
            <div style={{ height: 5, background: '#f0f0f0', borderRadius: 1000 }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${(f.score / 5) * 100}%` }} transition={{ duration: 0.7, delay: 0.1 + i * 0.05 }}
                style={{ height: '100%', background: color, borderRadius: 1000, opacity: dim ? 0.7 : 1 }} />
            </div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color, flexShrink: 0 }}>{f.score.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

function RankedBars({ items, total, demoteLast = [] }: {
  items: { label: string; value: number }[];
  total: number;
  demoteLast?: string[];
}) {
  const sorted = [...items].sort((a, b) => {
    const da = demoteLast.includes(a.label) ? 1 : 0;
    const db = demoteLast.includes(b.label) ? 1 : 0;
    if (da !== db) return da - db;
    return b.value - a.value;
  });
  const max = Math.max(1, ...items.map(i => i.value));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {sorted.map((it, i) => {
        const isOther = demoteLast.includes(it.label);
        const color = isOther ? C.barLight : C.bar;
        const pct = total ? Math.round((it.value / total) * 100) : 0;
        return (
          <div key={it.label} style={{ display: 'flex', alignItems: 'center', gap: 10, height: 24 }}>
            <span style={{ width: 96, fontSize: 11, color: '#595959', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }} title={it.label}>{it.label}</span>
            <div style={{ flex: 1, minWidth: 0, height: 5, background: '#f0f0f0', borderRadius: 1000, overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${(it.value / max) * 100}%` }} transition={{ duration: 0.6, delay: 0.05 + i * 0.04, ease: 'easeOut' }}
                style={{ height: '100%', background: color, borderRadius: 1000 }} />
            </div>
            <span style={{ width: 24, fontSize: 11, fontWeight: 700, color: '#262626', textAlign: 'right', flexShrink: 0 }}>{it.value}</span>
            <span style={{ width: 36, fontSize: 10.5, color: C.muted, textAlign: 'right', flexShrink: 0 }}>{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}
