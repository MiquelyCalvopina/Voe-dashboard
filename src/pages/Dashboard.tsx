import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend, PieChart, Pie,
  AreaChart, Area, ReferenceLine,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, Tag, Input, Button } from 'antd';
import {
  ALL_RECORDS, FILTER_OPTIONS, EMPTY_FILTERS, applyFilters, enpsStats, enpsStatus,
  themeCounts, sentimentCounts, demographic, factorAverages, comments, exitThemes, exitComments,
  type Filters,
} from '../data/compute';

const { Search } = Input;

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
};
const SENTIMENT_COLORS: Record<string, string> = {
  'Muy positivo': '#389e0d', 'Positivo': '#52c41a', 'Neutral': '#d4b106', 'Negativo': '#ff7a45', 'Muy negativo': '#f5222d',
};
const ENPS_COLORS: Record<string, string> = { 'Promotor': '#52c41a', 'Neutro': '#faad14', 'Detractor': '#ff4d4f' };
const PALETTE = [C.primary, C.promoter, C.pink, C.orange, C.purple, C.cyan, C.detractor, '#a0d911'];

const trunc = (s: string, n = 45) => (s.length > n ? s.slice(0, n) + '…' : s);

// ── Reusable UI ───────────────────────────────────────────────────────────────
function SectionHeader({ n, title, subtitle }: { n: number; title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: C.primary, color: '#fff', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</div>
      <div>
        <h2 style={{ fontSize: 15, fontWeight: 800, color: C.ink, margin: 0, letterSpacing: '-0.2px' }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 11.5, color: C.muted, margin: '2px 0 0' }}>{subtitle}</p>}
      </div>
    </div>
  );
}

function Card({ children, delay = 0, style = {}, pad = 18 }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties; pad?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay }}
      style={{ backgroundColor: '#fff', borderRadius: 14, padding: pad, border: '1px solid #f0f0f0', boxShadow: '0 1px 5px rgba(0,0,0,0.05)', minWidth: 0, ...style }}
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

function ProgressBar({ pct, color, delay = 0, h = 8 }: { pct: number; color: string; delay?: number; h?: number }) {
  return (
    <div style={{ height: h, backgroundColor: '#f5f5f5', borderRadius: 1000, overflow: 'hidden' }}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, delay, ease: 'easeOut' }}
        style={{ height: '100%', backgroundColor: color, borderRadius: 1000 }} />
    </div>
  );
}

const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', fontSize: 11 }}>
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

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [commentSearch, setCommentSearch] = useState('');

  const records = useMemo(() => applyFilters(ALL_RECORDS, filters), [filters]);

  const stats = useMemo(() => enpsStats(records), [records]);
  const byType = useMemo(() =>
    FILTER_OPTIONS.source.map(src => {
      const s = enpsStats(records.filter(r => r.source === src));
      return { type: src, label: src === 'Ex Colaboradores' ? 'Ex Colab.' : src, ...s };
    }).filter(d => d.total > 0)
  , [records]);
  // Voz del Colaborador: SOLO encuestas de experiencia (0-6m + +6m), nunca ex colaboradores
  const expRecords = useMemo(() => records.filter(r => r.source !== 'Ex Colaboradores'), [records]);
  const themes = useMemo(() => themeCounts(expRecords), [expRecords]);
  const sentiments = useMemo(() => sentimentCounts(expRecords), [expRecords]);
  const allFactors = useMemo(() => factorAverages(records), [records]);
  const cmts = useMemo(() => comments(expRecords), [expRecords]);
  const exThemes = useMemo(() => exitThemes(records), [records]);
  const exCmts = useMemo(() => exitComments(records), [records]);
  const genderDemo = useMemo(() => demographic(records, 'genero'), [records]);
  const areaDemo = useMemo(() => demographic(records, 'area'), [records]);

  // Drivers reales: solo factores con muestra confiable (nD≥5 y nP≥5)
  // Fortalezas = promedio ≥ mediana, ordenados por brecha P−D desc
  // Áreas a mejorar = promedio < mediana, ordenados por brecha P−D desc
  const reliableFactors = allFactors.filter(f => f.gap !== null);
  const scores = reliableFactors.map(f => f.score).sort((a, b) => a - b);
  const median = scores.length ? scores[Math.floor(scores.length / 2)] : 3.75;
  const top5 = reliableFactors.filter(f => f.score >= median).sort((a, b) => (b.gap ?? 0) - (a.gap ?? 0)).slice(0, 5);
  const bottom5 = reliableFactors.filter(f => f.score < median).sort((a, b) => (b.gap ?? 0) - (a.gap ?? 0)).slice(0, 5);

  // Journey: avg satisfaction (1-5 → %) per stage
  const journey = useMemo(() => STAGES.map(stage => {
    const stageFactors = allFactors.filter(f => f.stage === stage.key);
    const avg = stageFactors.length ? stageFactors.reduce((a, b) => a + b.score, 0) / stageFactors.length : 0;
    const stageRecords = records.filter(r => (stage.sources as readonly string[]).includes(r.source));
    const s = enpsStats(stageRecords);
    const best = [...stageFactors].sort((a, b) => b.score - a.score)[0];
    const worst = [...stageFactors].sort((a, b) => a.score - b.score)[0];
    return {
      ...stage, avg: Math.round(avg * 100) / 100, satisfaction: Math.round((avg / 5) * 100),
      enps: s.enps, n: s.total, best, worst,
    };
  }).filter(j => j.n > 0), [records, allFactors]);

  // Promoters vs detractors by theme
  const themesComparison = useMemo(() => {
    const promoTh = themeCounts(records.filter(r => r.cat === 'Promotor'));
    const detrTh = themeCounts(records.filter(r => r.cat === 'Detractor'));
    const names = [...new Set([...promoTh.map(t => t.tema), ...detrTh.map(t => t.tema)])];
    return names.map(tema => ({
      tema,
      Promotores: promoTh.find(t => t.tema === tema)?.count || 0,
      Detractores: detrTh.find(t => t.tema === tema)?.count || 0,
    })).sort((a, b) => (b.Promotores + b.Detractores) - (a.Promotores + a.Detractores));
  }, [records]);

  const exStats = useMemo(() => enpsStats(records.filter(r => r.source === 'Ex Colaboradores')), [records]);
  const exFactors = allFactors.filter(f => f.stage === 'Salida');

  const sentimentOrder = ['Muy positivo', 'Positivo', 'Neutral', 'Negativo', 'Muy negativo'];
  const totalSentiments = sentiments.reduce((a, b) => a + b.count, 0);

  const filteredComments = cmts.filter(c =>
    !commentSearch || c.comment.toLowerCase().includes(commentSearch.toLowerCase())
  );

  // ── Filter helpers ──
  const activeFilterCount = Object.values(filters).reduce((a, arr) => a + arr.length, 0);
  const toggleFilter = (key: keyof Filters, value: string) => {
    setFilters(prev => {
      const arr = prev[key];
      return { ...prev, [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });
  };
  const setFilter = (key: keyof Filters, vals: string[]) => setFilters(prev => ({ ...prev, [key]: vals }));

  const status = enpsStatus(stats.enps);
  const donutData = [
    { name: 'Promotores', value: stats.promoters, color: C.promoter },
    { name: 'Neutros', value: stats.neutrals, color: C.neutral },
    { name: 'Detractores', value: stats.detractors, color: C.detractor },
  ];

  return (
    <div style={{ padding: `20px ${GAP}px 40px`, display: 'flex', flexDirection: 'column', gap: 36 }}>

      {/* ═══ TÍTULO + FILTROS ═══ */}
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: C.ink, margin: 0, letterSpacing: '-0.4px' }}>
          Voz del Colaborador · Mutualista Pichincha
        </h1>
        <p style={{ fontSize: 12, color: C.muted, margin: '4px 0 16px', maxWidth: 720 }}>
          ¿Cómo es la experiencia del colaborador durante su ciclo de vida y cuáles son los principales impulsores de satisfacción y riesgo de salida?
        </p>

        {/* Barra de filtros */}
        <Card pad={14} style={{ position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 4h18l-7 8v6l-4 2v-8L3 4z" fill={C.primary} /></svg>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>Filtros</span>
            {activeFilterCount > 0 && (
              <Tag color="blue" style={{ borderRadius: 1000, fontSize: 10, margin: 0 }}>{activeFilterCount} activo{activeFilterCount > 1 ? 's' : ''}</Tag>
            )}
            <span style={{ marginLeft: 'auto', fontSize: 11, color: C.muted }}>{stats.total} de {ALL_RECORDS.length} respuestas</span>
            {activeFilterCount > 0 && (
              <Button size="small" type="text" onClick={() => setFilters(EMPTY_FILTERS)} style={{ fontSize: 11, color: C.detractor, padding: '0 8px' }}>
                Limpiar todo
              </Button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
            {([
              ['area', 'Área', FILTER_OPTIONS.area],
              ['ciudad', 'Ciudad', FILTER_OPTIONS.ciudad],
              ['nivel', 'Cargo', FILTER_OPTIONS.nivel],
              ['antiguedad', 'Antigüedad', FILTER_OPTIONS.antiguedad],
              ['genero', 'Género', FILTER_OPTIONS.genero],
              ['generacion', 'Edad / Generación', FILTER_OPTIONS.generacion],
            ] as [keyof Filters, string, string[]][]).map(([key, label, opts]) => (
              <Select
                key={key}
                mode="multiple"
                maxTagCount={0}
                maxTagPlaceholder={(o) => `${o.length} sel.`}
                allowClear
                size="small"
                placeholder={label}
                value={filters[key]}
                onChange={(vals) => setFilter(key, vals as string[])}
                options={opts.map(o => ({ value: o, label: o }))}
                style={{ width: '100%' }}
              />
            ))}
          </div>
        </Card>
      </div>

      {/* ═══ SECCIÓN 1: RESUMEN ═══ */}
      <section>
        <SectionHeader n={1} title="Resumen Ejecutivo" subtitle="La foto general de la experiencia del colaborador" />
        <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.7fr 1.4fr', gap: GAP }}>

          {/* Total participantes */}
          <Card delay={0}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Participantes</div>
            <div style={{ fontSize: 44, fontWeight: 800, color: C.primary, lineHeight: 1.05, marginTop: 10 }}>{stats.total}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4, marginBottom: 16 }}>respuestas analizadas</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {byType.map((d, i) => (
                <div key={d.type} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                  <span style={{ color: C.muted }}>{d.label}</span>
                  <span style={{ fontWeight: 700, color: PALETTE[i] }}>{d.total}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* eNPS consolidado (hero) */}
          <Card delay={0.08}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>eNPS · Net Promoter Score</span>
              <Tag style={{ borderRadius: 1000, fontWeight: 700, fontSize: 11, color: status.color, background: status.bg, border: `1px solid ${status.color}33`, margin: 0 }}>
                {status.label}
              </Tag>
            </div>
            <div style={{ display: 'flex', gap: 6, fontSize: 10, color: C.muted, marginBottom: 14 }}>
              <span>Crítico: -100 a 0</span><span>·</span><span>Regular: 1 a 30</span><span>·</span><span>Bueno: 31 a 75</span><span>·</span><span>Excelente: 76+</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ flexShrink: 0 }}>
                <div style={{ fontSize: 52, fontWeight: 800, color: status.color, lineHeight: 1 }}>
                  {stats.enps}<span style={{ fontSize: 22, color: '#d9d9d9', fontWeight: 700 }}>/100</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 16 }}>
                  {donutData.map(d => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5 }}>
                      <span style={{ width: 9, height: 9, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                      <span style={{ color: C.muted, width: 86 }}>{d.name}</span>
                      <span style={{ fontWeight: 700, color: d.color }}>
                        {stats.total ? Math.round((d.value / stats.total) * 1000) / 10 : 0}%
                      </span>
                      <span style={{ color: '#bfbfbf', fontSize: 10 }}>({d.value})</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0, height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donutData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={52} outerRadius={80}
                      paddingAngle={3} cornerRadius={6} startAngle={90} endAngle={-270}>
                      {donutData.map((d, i) => <Cell key={i} fill={d.color} stroke="none" />)}
                    </Pie>
                    <Tooltip content={<ChartTip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>

          {/* eNPS por tipo */}
          <Card delay={0.16}>
            <CardTitle title="eNPS por Tipo de Colaborador" sub="Click en una barra para filtrar el reporte" />
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={byType} margin={{ top: 14, right: 8, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10.5, fill: '#595959' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#bfbfbf' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                <Bar dataKey="enps" name="eNPS" radius={[7, 7, 0, 0]} maxBarSize={56} cursor="pointer"
                  activeBar={false} onClick={(d: any) => toggleFilter('source', d.type)}
                  label={{ position: 'top', fontSize: 12, fontWeight: 800, fill: C.ink }}>
                  {byType.map((d, i) => (
                    <Cell key={i} fill={filters.source.includes(d.type) ? C.primary : enpsStatus(d.enps).color}
                      opacity={filters.source.length && !filters.source.includes(d.type) ? 0.4 : 1} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </section>

      {/* ═══ SECCIÓN 2: JOURNEY ═══ */}
      <section>
        <SectionHeader n={2} title="El Viaje del Colaborador" subtitle="Cómo evoluciona la satisfacción a lo largo del ciclo de vida (promedio escala 1-5)" />

        <Card delay={0} pad={22}>
          {/* Journey curve */}
          <div style={{ height: 150, marginBottom: 4 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={journey} margin={{ top: 16, right: 30, left: 30, bottom: 0 }}>
                <defs>
                  <linearGradient id="journeyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.primary} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={C.primary} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#595959', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 90]} hide />
                <Tooltip content={({ active, payload }: any) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', fontSize: 11 }}>
                      <p style={{ fontWeight: 700, color: C.ink }}>{d.label}</p>
                      <p style={{ color: C.primary }}>Satisfacción: {d.satisfaction}% ({d.avg}/5)</p>
                      <p style={{ color: C.muted }}>eNPS: {d.enps} · {d.n} respuestas</p>
                    </div>
                  );
                }} />
                <Area type="monotone" dataKey="satisfaction" stroke={C.primary} strokeWidth={2.5} fill="url(#journeyGrad)"
                  dot={{ r: 5, fill: '#fff', stroke: C.primary, strokeWidth: 2.5 }}
                  activeDot={{ r: 7, fill: C.primary }}
                  label={{ position: 'top', fontSize: 11, fontWeight: 800, fill: C.primary, formatter: (v: any) => `${v}%` }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Stage cards */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${journey.length}, 1fr)`, gap: 12, marginTop: 14 }}>
            {journey.map((j, i) => (
              <motion.div key={j.key}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}
                style={{ position: 'relative', padding: 14, borderRadius: 12, background: '#fafbfc', border: '1px solid #f0f0f0' }}>
                {/* connector arrow */}
                {i < journey.length - 1 && (
                  <div style={{ position: 'absolute', right: -12, top: '50%', transform: 'translateY(-50%)', zIndex: 2, color: '#d9d9d9', fontSize: 16 }}>›</div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: `${j.color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>{j.icon}</div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: C.ink, lineHeight: 1.15 }}>{j.label}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: j.color }}>{j.satisfaction}%</span>
                  <span style={{ fontSize: 10, color: C.muted }}>satisf.</span>
                </div>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 10 }}>eNPS {j.enps} · {j.n} resp.</div>
                {j.best && (
                  <div style={{ marginBottom: 6 }}>
                    <div style={{ fontSize: 9, color: C.promoter, fontWeight: 700, marginBottom: 1 }}>▲ Fortaleza</div>
                    <div style={{ fontSize: 9.5, color: '#595959', lineHeight: 1.25 }} title={j.best.label}>{trunc(j.best.label, 36)}</div>
                  </div>
                )}
                {j.worst && j.worst.label !== j.best?.label && (
                  <div>
                    <div style={{ fontSize: 9, color: C.detractor, fontWeight: 700, marginBottom: 1 }}>▼ A mejorar</div>
                    <div style={{ fontSize: 9.5, color: '#595959', lineHeight: 1.25 }} title={j.worst.label}>{trunc(j.worst.label, 36)}</div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </Card>
      </section>

      {/* ═══ SECCIÓN 3: DRIVERS ═══ */}
      <section>
        <SectionHeader n={3} title="Drivers de Satisfacción y Riesgo de Salida" subtitle="Qué impulsa a los promotores y qué genera detractores" />
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: GAP, marginBottom: GAP }}>
          <Card delay={0.05}>
            <CardTitle title="Promotores vs Detractores · Temas mencionados" />
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={themesComparison} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="tema" tick={{ fontSize: 10, fill: '#595959' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#bfbfbf' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                <Legend wrapperStyle={{ fontSize: 10.5, paddingTop: 6 }} />
                <Bar dataKey="Promotores" fill={C.promoter} radius={[4, 4, 0, 0]} maxBarSize={26} activeBar={false} />
                <Bar dataKey="Detractores" fill={C.detractor} radius={[4, 4, 0, 0]} maxBarSize={26} activeBar={false} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card delay={0.1}>
            <CardTitle title="Heatmap de Factores" sub="Promedio de acuerdo por factor (escala 1-5)" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, maxHeight: 190, overflowY: 'auto' }}>
              {[...allFactors].sort((a, b) => b.score - a.score).slice(0, 12).map((f, i) => {
                const t = Math.min(1, Math.max(0, (f.score - 3.4) / 1.6));
                const r = Math.round(255 - t * 173), g = Math.round(77 + t * 119), b = Math.round(79 - t * 53);
                return (
                  <motion.div key={f.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 + i * 0.02 }}
                    style={{ borderRadius: 7, padding: '5px 8px', background: `rgb(${r},${g},${b})`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 9, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={f.label}>{trunc(f.label, 26)}</span>
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{f.score.toFixed(2)}</span>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: GAP }}>
          <Card delay={0.15}>
            <CardTitle title="Top 5 Fortalezas" sub="Bien evaluados · mayor brecha Promotor−Detractor" />
            <FactorList items={top5} color={C.promoter} bg="#f6ffed" />
          </Card>
          <Card delay={0.2}>
            <CardTitle title="Top 5 Áreas a Mejorar" sub="Bajo promedio · mayor impacto en detractores" />
            <FactorList items={bottom5} color={C.detractor} bg="#fff1f0" dim />
          </Card>
        </div>
      </section>

      {/* ═══ SECCIÓN 4: VOZ ═══ */}
      <section>
        <SectionHeader n={4} title="Voz del Colaborador" subtitle="Qué dicen los colaboradores activos en sus comentarios (encuestas 0-6 y +6 meses)" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: GAP, alignItems: 'start' }}>

          {/* ── Primera columna: gráficas de categorización ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>

            {/* Sentimiento general — barra divergente 100% */}
            <Card delay={0.05}>
              <CardTitle title="Sentimiento General" sub={`${totalSentiments} comentarios · click para filtrar`} />
              <SentimentBar
                data={sentiments}
                total={totalSentiments}
                order={sentimentOrder}
                colors={SENTIMENT_COLORS}
                active={filters.sentimiento}
                onToggle={(s) => toggleFilter('sentimiento', s)}
              />
            </Card>

            {/* Temas mencionados — lista rankeada que crece */}
            <Card delay={0.1}>
              <CardTitle title="Temas Mencionados" sub="Ordenados por frecuencia · click para filtrar" />
              <RankedBars
                items={themes.map(t => ({ label: t.tema, value: t.count }))}
                total={totalSentiments}
                active={filters.tema}
                onToggle={(t) => toggleFilter('tema', t)}
                demoteLast={['Otros']}
              />
            </Card>
          </div>

          {/* ── Segunda columna: comentarios verbatim ── */}
          <Card delay={0.15}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 12 }}>
              <CardTitle title="Comentarios Verbatim" sub={`${filteredComments.length} comentarios`} />
              <Search placeholder="Buscar en comentarios..." onChange={e => setCommentSearch(e.target.value)} size="small" allowClear style={{ maxWidth: 240 }} />
            </div>
            <div style={{ maxHeight: 560, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <AnimatePresence>
                {filteredComments.slice(0, 60).map((c, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.012 }}
                    style={{ padding: '10px 13px', background: '#fafafa', borderRadius: 9, border: '1px solid #f0f0f0', borderLeft: `3px solid ${SENTIMENT_COLORS[c.sentimiento || ''] || '#d9d9d9'}` }}>
                    <div style={{ display: 'flex', gap: 5, marginBottom: 5, flexWrap: 'wrap' }}>
                      {c.cat && <Tag color={ENPS_COLORS[c.cat] || 'default'} style={{ fontSize: 10, borderRadius: 1000, margin: 0 }}>{c.cat}</Tag>}
                      <Tag color="blue" style={{ fontSize: 10, borderRadius: 1000, margin: 0 }}>{c.source}</Tag>
                      {c.tema && <Tag style={{ fontSize: 10, borderRadius: 1000, margin: 0 }}>{c.tema}</Tag>}
                      {c.sentimiento && <Tag style={{ fontSize: 10, borderRadius: 1000, margin: 0, background: `${SENTIMENT_COLORS[c.sentimiento]}22`, borderColor: SENTIMENT_COLORS[c.sentimiento], color: SENTIMENT_COLORS[c.sentimiento] }}>{c.sentimiento}</Tag>}
                    </div>
                    <p style={{ fontSize: 11.5, color: '#595959', margin: 0, lineHeight: 1.5 }}>{c.comment}</p>
                    {c.area && <div style={{ fontSize: 9.5, color: '#bfbfbf', marginTop: 4 }}>📍 {c.area}</div>}
                  </motion.div>
                ))}
              </AnimatePresence>
              {filteredComments.length === 0 && <div style={{ textAlign: 'center', padding: '28px 0', color: '#bfbfbf', fontSize: 12 }}>Sin resultados</div>}
            </div>
          </Card>
        </div>
      </section>

      {/* ═══ SECCIÓN 5: EX COLABORADORES ═══ */}
      {exStats.total > 0 && (
        <section>
          <SectionHeader n={5} title="Ex Colaboradores · Proceso de Salida" subtitle="Qué se llevaron al salir y qué pudo evitar su desvinculación" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: GAP }}>
            <Card delay={0.05}>
              <CardTitle title="Evaluación del Proceso de Salida" sub="Promedio de acuerdo (escala 1-5)" />
              <FactorList items={[...exFactors].sort((a, b) => b.score - a.score)} color={C.pink} bg="#fff0f6" valueScale />
            </Card>
            <Card delay={0.1}>
              <CardTitle title="¿Cómo evitar la desvinculación?" sub="Temas en respuestas abiertas · click para filtrar" />
              {exThemes.length > 0 ? (
                <ResponsiveContainer width="100%" height={190}>
                  <BarChart data={exThemes} margin={{ top: 14, right: 16, left: -22, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="tema" tick={{ fontSize: 10, fill: '#595959' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#bfbfbf' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                    <Bar dataKey="count" name="Menciones" radius={[6, 6, 0, 0]} maxBarSize={44} cursor="pointer" activeBar={false}
                      onClick={(d: any) => toggleFilter('exit_tema', d.tema)}
                      label={{ position: 'top', fontSize: 10, fill: '#8c8c8c' }}>
                      {exThemes.map((t, i) => (
                        <Cell key={i} fill={`hsl(${330 + i * 28}, 64%, ${58 + i * 4}%)`}
                          opacity={filters.exit_tema.length && !filters.exit_tema.includes(t.tema) ? 0.4 : 1} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <div style={{ padding: '40px 0', textAlign: 'center', color: '#bfbfbf', fontSize: 12 }}>Sin datos para este filtro</div>}
            </Card>
          </div>
          {exCmts.length > 0 && (
            <Card delay={0.15} style={{ marginTop: GAP }}>
              <CardTitle title="Comentarios de Desvinculación" sub={`${exCmts.length} respuestas`} />
              <div style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {exCmts.slice(0, 20).map((c, i) => (
                  <div key={i} style={{ padding: '10px 13px', background: '#fafafa', borderRadius: 9, border: '1px solid #f0f0f0', borderLeft: `3px solid ${SENTIMENT_COLORS[c.sentimiento || ''] || '#d9d9d9'}` }}>
                    <div style={{ display: 'flex', gap: 5, marginBottom: 5, flexWrap: 'wrap' }}>
                      {c.cat && <Tag color={ENPS_COLORS[c.cat] || 'default'} style={{ fontSize: 10, borderRadius: 1000, margin: 0 }}>{c.cat}</Tag>}
                      {c.tema && <Tag style={{ fontSize: 10, borderRadius: 1000, margin: 0 }}>{c.tema}</Tag>}
                    </div>
                    <p style={{ fontSize: 11.5, color: '#595959', margin: 0, lineHeight: 1.5 }}>{c.comment}</p>
                    {c.area && <div style={{ fontSize: 9.5, color: '#bfbfbf', marginTop: 4 }}>📍 {c.area}</div>}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </section>
      )}

      {/* ═══ SECCIÓN 6: BENCHMARK ═══ */}
      <section>
        <SectionHeader n={6} title="Benchmark Interno" subtitle="Cómo se comparan los distintos segmentos" />
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr', gap: GAP }}>
          <Card delay={0.05}>
            <CardTitle title="eNPS por Segmento" sub="Comparación por tipo de colaborador" />
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={byType} margin={{ top: 14, right: 8, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#595959' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#bfbfbf' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                <ReferenceLine y={0} stroke="#d9d9d9" />
                <Bar dataKey="enps" name="eNPS" radius={[6, 6, 0, 0]} maxBarSize={56} activeBar={false}
                  label={{ position: 'top', fontSize: 11, fontWeight: 700, fill: C.ink }}>
                  {byType.map((_, i) => <Cell key={i} fill={PALETTE[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card delay={0.1}>
            <CardTitle title="Por Género" sub="Distribución de participantes" />
            <DemoBars items={genderDemo} total={genderDemo.reduce((a, b) => a + b.value, 0)} />
          </Card>

          <Card delay={0.15}>
            <CardTitle title="Top Áreas" sub="Participantes por área" />
            <DemoBars items={areaDemo.slice(0, 6)} total={areaDemo.reduce((a, b) => a + b.value, 0)} small />
          </Card>
        </div>
      </section>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function FactorList({ items, color, bg, dim, valueScale }: { items: { label: string; score: number }[]; color: string; bg: string; dim?: boolean; valueScale?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {items.map((f, i) => (
        <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          {!valueScale && (
            <div style={{ width: 19, height: 19, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9.5, fontWeight: 700, color, flexShrink: 0 }}>{i + 1}</div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10.5, color: '#595959', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={f.label}>{f.label}</div>
            <div style={{ height: 5, background: '#f5f5f5', borderRadius: 1000, marginTop: 3 }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${(f.score / 5) * 100}%` }} transition={{ duration: 0.7, delay: 0.1 + i * 0.05 }}
                style={{ height: '100%', background: color, borderRadius: 1000, opacity: dim ? 0.7 : 1 }} />
            </div>
          </div>
          <span style={{ fontSize: 10.5, fontWeight: 700, color, flexShrink: 0 }}>{f.score.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

// ── Sentimiento: barra divergente 100% apilada (estándar CX) ────────────────────
function SentimentBar({ data, total, order, colors, active, onToggle }: {
  data: { sentimiento: string; count: number }[];
  total: number;
  order: string[];
  colors: Record<string, string>;
  active: string[];
  onToggle: (s: string) => void;
}) {
  const get = (s: string) => data.find(d => d.sentimiento === s)?.count || 0;
  // De más negativo a más positivo para la barra (izq → der)
  const barOrder = [...order].reverse();
  const posPct = total ? Math.round(((get('Muy positivo') + get('Positivo')) / total) * 100) : 0;
  const negPct = total ? Math.round(((get('Muy negativo') + get('Negativo')) / total) * 100) : 0;

  return (
    <div>
      {/* Titular: balance de sentimiento */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 32, fontWeight: 800, color: C.promoter, lineHeight: 1 }}>{posPct}%</span>
        <span style={{ fontSize: 11, color: C.muted }}>positivo</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: C.muted }}>
          <span style={{ color: C.detractor, fontWeight: 700 }}>{negPct}%</span> negativo
        </span>
      </div>

      {/* Barra 100% apilada */}
      <div style={{ display: 'flex', width: '100%', height: 16, borderRadius: 1000, overflow: 'hidden', background: '#f5f5f5' }}>
        {barOrder.map(s => {
          const count = get(s);
          if (!count) return null;
          const pct = (count / total) * 100;
          const dim = active.length && !active.includes(s);
          return (
            <motion.div key={s} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, ease: 'easeOut' }}
              onClick={() => onToggle(s)} title={`${s}: ${Math.round(pct)}% (${count})`}
              style={{ height: '100%', background: colors[s], cursor: 'pointer', opacity: dim ? 0.35 : 1 }} />
          );
        })}
      </div>

      {/* Leyenda alineada en grilla (crece en filas) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginTop: 14 }}>
        {order.map(s => {
          const count = get(s);
          const pct = total ? Math.round((count / total) * 100) : 0;
          const isActive = active.includes(s);
          return (
            <div key={s} onClick={() => onToggle(s)}
              style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', opacity: active.length && !isActive ? 0.4 : 1 }}>
              <span style={{ width: 9, height: 9, borderRadius: 3, background: colors[s], flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: '#595959', fontWeight: isActive ? 700 : 400, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: colors[s], flexShrink: 0 }}>{pct}%</span>
              <span style={{ fontSize: 10, color: '#bfbfbf', flexShrink: 0, width: 30, textAlign: 'right' }}>({count})</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Categorización rankeada: columnas cuadradas, crece en N categorías ──────────
function RankedBars({ items, total, active, onToggle, demoteLast = [] }: {
  items: { label: string; value: number }[];
  total: number;
  active: string[];
  onToggle: (label: string) => void;
  demoteLast?: string[];
}) {
  // Orden por frecuencia, pero las categorías "cajón de sastre" siempre al final
  const sorted = [...items].sort((a, b) => {
    const da = demoteLast.includes(a.label) ? 1 : 0;
    const db = demoteLast.includes(b.label) ? 1 : 0;
    if (da !== db) return da - db;
    return b.value - a.value;
  });
  const max = Math.max(1, ...items.map(i => i.value));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, maxHeight: 260, overflowY: 'auto' }}>
      {sorted.map((it, i) => {
        const isOther = demoteLast.includes(it.label);
        const color = isOther ? '#bfbfbf' : PALETTE[i % PALETTE.length];
        const isActive = active.includes(it.label);
        const pct = total ? Math.round((it.value / total) * 100) : 0;
        return (
          <div key={it.label} onClick={() => onToggle(it.label)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', height: 26,
              opacity: active.length && !isActive ? 0.4 : 1 }}>
            {/* Etiqueta: columna fija */}
            <span style={{ width: 96, fontSize: 11, fontWeight: isActive ? 700 : 400, color: '#595959', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }} title={it.label}>{it.label}</span>
            {/* Barra: flexible */}
            <div style={{ flex: 1, minWidth: 0, height: 10, background: '#f5f5f5', borderRadius: 1000, overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${(it.value / max) * 100}%` }} transition={{ duration: 0.6, delay: 0.05 + i * 0.04, ease: 'easeOut' }}
                style={{ height: '100%', background: color, borderRadius: 1000 }} />
            </div>
            {/* Conteo + %: columnas fijas alineadas a la derecha */}
            <span style={{ width: 28, fontSize: 11, fontWeight: 700, color: '#262626', textAlign: 'right', flexShrink: 0 }}>{it.value}</span>
            <span style={{ width: 36, fontSize: 10.5, color: C.muted, textAlign: 'right', flexShrink: 0 }}>{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}

function DemoBars({ items, total, small }: { items: { label: string; value: number }[]; total: number; small?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: small ? 7 : 11 }}>
      {items.map((d, i) => {
        const pct = total ? Math.round((d.value / total) * 100) : 0;
        return (
          <div key={d.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: small ? 10 : 11, color: '#595959' }} title={d.label}>{trunc(d.label, 28)}</span>
              <span style={{ fontSize: small ? 10 : 11, fontWeight: 700, color: PALETTE[i % PALETTE.length] }}>{pct}%</span>
            </div>
            <ProgressBar pct={pct} color={PALETTE[i % PALETTE.length]} delay={0.1 + i * 0.04} h={small ? 6 : 8} />
          </div>
        );
      })}
    </div>
  );
}
