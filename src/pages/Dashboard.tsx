import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend, ReferenceLine,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, Tag, Input } from 'antd';
import data from '../data/dashboardData.json';

const { Search } = Input;

// ── Colors ──────────────────────────────────────────────────────────────────
const C = {
  promoter: '#52c41a',
  neutral: '#faad14',
  detractor: '#ff4d4f',
  primary: '#1677ff',
  purple: '#722ed1',
  pink: '#eb2f96',
  cyan: '#13c2c2',
  orange: '#fa8c16',
};

const SENTIMENT_COLORS: Record<string, string> = {
  'Muy positivo': '#389e0d',
  'Positivo': '#52c41a',
  'Neutral': '#d4b106',
  'Negativo': '#ff7a45',
  'Muy negativo': '#f5222d',
};

const ENPS_COLORS: Record<string, string> = {
  'Promotor': '#52c41a',
  'Neutro': '#faad14',
  'Detractor': '#ff4d4f',
};

const PALETTE = [C.primary, C.promoter, C.pink, C.orange, C.purple, C.cyan, C.detractor, '#a0d911'];

// ── Helpers ──────────────────────────────────────────────────────────────────
function trunc(s: string, n = 45) { return s.length > n ? s.slice(0, n) + '…' : s; }

function ProgressBar({ pct, color, delay = 0 }: { pct: number; color: string; delay?: number }) {
  return (
    <div style={{ height: 8, backgroundColor: '#f5f5f5', borderRadius: 1000, overflow: 'hidden' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, delay, ease: 'easeOut' }}
        style={{ height: '100%', backgroundColor: color, borderRadius: 1000 }}
      />
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 14, paddingBottom: 10, borderBottom: '2px solid #f0f0f0' }}>
      <h2 style={{ fontSize: 14, fontWeight: 800, color: '#1a1a2e', margin: 0, letterSpacing: '-0.2px' }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 11, color: '#8c8c8c', margin: '3px 0 0' }}>{subtitle}</p>}
    </div>
  );
}

function Card({ children, delay = 0, style = {} }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      style={{
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: '14px 18px',
        border: '1px solid #f0f0f0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

function CardTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1a2e' }}>{title}</div>
      {sub && <div style={{ fontSize: 10, color: '#8c8c8c', marginTop: 1 }}>{sub}</div>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 11 }}>
      <p style={{ fontWeight: 700, marginBottom: 4, color: '#1a1a2e' }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.fill || p.color, margin: '2px 0' }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

// ── Pre-computed data ─────────────────────────────────────────────────────────
const combined = data.summary.combined;
const byType = data.enps_by_type;

const allFactors = [
  ...data.factors.senior.all,
  ...data.factors.new06.all,
  ...data.factors.ex.all,
] as { label: string; score: number }[];

const uniqueFactors: { label: string; score: number }[] = Object.values(
  allFactors.reduce((acc: Record<string, { label: string; score: number }>, f) => {
    if (!acc[f.label]) acc[f.label] = f;
    return acc;
  }, {})
);

const top5 = [...uniqueFactors].sort((a, b) => b.score - a.score).slice(0, 5);
const bottom5 = [...uniqueFactors].sort((a, b) => a.score - b.score).slice(0, 5);

const promoterThemes = (data as any).themes_promotor as { tema: string; count: number }[];
const detractorThemes = (data as any).themes_detractor as { tema: string; count: number }[];
const allThemeNames = [...new Set([...promoterThemes.map((t: any) => t.tema), ...detractorThemes.map((t: any) => t.tema)])];
const themesComparison = allThemeNames.map(tema => ({
  tema,
  Promotores: promoterThemes.find(t => t.tema === tema)?.count || 0,
  Detractores: detractorThemes.find(t => t.tema === tema)?.count || 0,
})).sort((a, b) => (b.Promotores + b.Detractores) - (a.Promotores + a.Detractores));

const sentimentOrder = ['Muy positivo', 'Positivo', 'Neutral', 'Negativo', 'Muy negativo'];
const totalComments = data.comments.length;

const HEATMAP_FACTORS = data.factors.senior.all.slice(0, 12) as { label: string; score: number }[];

// Lifecycle stage data
const stages = [
  { key: 'Selección & Contratación', icon: '🎯', color: C.primary, bg: '#e6f4ff', enps: data.summary.new06.enps, factors: data.factors.new06.all.slice(0, 3) },
  { key: 'Onboarding', icon: '🚀', color: C.cyan, bg: '#e6fffb', enps: data.summary.new06.enps, factors: data.factors.new06.all.slice(3, 6) },
  { key: 'Día a Día & Desarrollo', icon: '💼', color: C.purple, bg: '#f9f0ff', enps: data.summary.senior.enps, factors: data.factors.senior.all.slice(0, 3) },
  { key: 'Proceso de Salida', icon: '🔄', color: C.pink, bg: '#fff0f6', enps: data.summary.ex.enps, factors: data.factors.ex.all.slice(0, 3) },
] as const;

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [commentSearch, setCommentSearch] = useState('');
  const [commentSource, setCommentSource] = useState<string | null>(null);
  const [commentSent, setCommentSent] = useState<string | null>(null);

  const filteredComments = data.comments.filter(c => {
    if (commentSource && c.source !== commentSource) return false;
    if (commentSent && c.sentimiento !== commentSent) return false;
    if (commentSearch && !c.comment.toLowerCase().includes(commentSearch.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ padding: '20px 0 32px', display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ══════════════════════════════════════════════════
          SECCIÓN 1: RESUMEN EJECUTIVO
      ══════════════════════════════════════════════════ */}
      <section>
        <SectionHeader
          title="Resumen Ejecutivo"
          subtitle="¿Cómo está la experiencia del colaborador hoy? · 378 participantes · 3 grupos encuestados"
        />

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 12 }}>
          {[
            { title: 'eNPS General', value: combined.enps, sub: 'Escala -100 a 100', color: C.promoter, bg: '#f6ffed' },
            { title: 'Total Participantes', value: combined.total, sub: '3 grupos encuestados', color: C.primary, bg: '#e6f4ff' },
            { title: '% Promotores', value: `${combined.pct_promoters}%`, sub: `${combined.promoters} colaboradores`, color: C.promoter, bg: '#f6ffed' },
            { title: '% Detractores', value: `${combined.pct_detractors}%`, sub: `${combined.detractors} colaboradores`, color: C.detractor, bg: '#fff1f0' },
          ].map((kpi, i) => (
            <Card key={kpi.title} delay={i * 0.05}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{kpi.title}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: kpi.color, lineHeight: 1 }}>{kpi.value}</div>
              <div style={{ fontSize: 10, color: '#8c8c8c', marginTop: 4 }}>{kpi.sub}</div>
            </Card>
          ))}
        </div>

        {/* eNPS distribution + by type */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 10 }}>
          <Card delay={0.2}>
            <CardTitle title="Distribución eNPS" sub="Composición total de respuestas" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Promotores', pct: combined.pct_promoters, count: combined.promoters, color: C.promoter },
                { label: 'Neutros', pct: combined.pct_neutrals, count: combined.neutrals, color: C.neutral },
                { label: 'Detractores', pct: combined.pct_detractors, count: combined.detractors, color: C.detractor },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: '#595959' }}>{item.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: item.color }}>{item.pct}% <span style={{ fontWeight: 400, color: '#bfbfbf' }}>({item.count})</span></span>
                  </div>
                  <ProgressBar pct={item.pct} color={item.color} delay={0.3} />
                </div>
              ))}
              <div style={{ marginTop: 6, padding: '8px 14px', background: '#fafafe', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#595959' }}>Score eNPS</span>
                <span style={{ fontSize: 26, fontWeight: 800, color: C.promoter }}>{combined.enps}</span>
              </div>
            </div>
          </Card>

          <Card delay={0.25}>
            <CardTitle title="eNPS por Tipo de Colaborador" sub="Comparación entre los tres grupos" />
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={byType} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#595959' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#bfbfbf' }} axisLine={false} tickLine={false} domain={[0, 80]} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="#d9d9d9" />
                <Bar dataKey="enps" name="eNPS" radius={[6, 6, 0, 0]} maxBarSize={54}
                  label={{ position: 'top', fontSize: 11, fontWeight: 700, fill: '#1a1a2e' }}>
                  {byType.map((d, i) => <Cell key={i} fill={d.enps >= 60 ? C.promoter : C.primary} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {byType.map(d => (
                <div key={d.type} style={{ flex: 1, padding: '6px 10px', background: '#fafafa', borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#8c8c8c', marginBottom: 2 }}>{d.label}</div>
                  <span style={{ fontSize: 10, color: C.promoter, fontWeight: 700 }}>P {d.pct_promoters}%</span>{'  '}
                  <span style={{ fontSize: 10, color: C.detractor, fontWeight: 700 }}>D {d.pct_detractors}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECCIÓN 2: CICLO DE VIDA
      ══════════════════════════════════════════════════ */}
      <section>
        <SectionHeader
          title="Experiencia en el Ciclo de Vida"
          subtitle="¿Cómo vive el colaborador cada etapa de su paso por Mutualista Pichincha?"
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {stages.map((stage, i) => (
            <Card key={stage.key} delay={i * 0.08}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: stage.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
                  {stage.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#1a1a2e', lineHeight: 1.2 }}>{stage.key}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: stage.color }}>{stage.enps}</div>
                  <div style={{ fontSize: 9, color: '#8c8c8c' }}>eNPS</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(stage.factors as { label: string; score: number }[]).map(f => (
                  <div key={f.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontSize: 9, color: '#595959' }} title={f.label}>{trunc(f.label, 38)}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, color: stage.color, flexShrink: 0, marginLeft: 4 }}>{f.score.toFixed(2)}</span>
                    </div>
                    <div style={{ height: 4, background: '#f5f5f5', borderRadius: 1000, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(f.score / 5) * 100}%` }}
                        transition={{ duration: 0.7, delay: 0.2 + i * 0.08 }}
                        style={{ height: '100%', background: stage.color, borderRadius: 1000, opacity: 0.75 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECCIÓN 3: DRIVERS DE SATISFACCIÓN
      ══════════════════════════════════════════════════ */}
      <section>
        <SectionHeader
          title="Drivers de Satisfacción y Riesgo de Salida"
          subtitle="¿Qué impulsa a los promotores y qué genera a los detractores?"
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 10, marginBottom: 10 }}>
          <Card delay={0.05}>
            <CardTitle title="Promotores vs Detractores · Temas en Comentarios" />
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={themesComparison} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="tema" tick={{ fontSize: 10, fill: '#595959' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#bfbfbf' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10, paddingTop: 6 }} />
                <Bar dataKey="Promotores" fill={C.promoter} radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="Detractores" fill={C.detractor} radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card delay={0.1}>
            <CardTitle title="Heatmap de Factores · +6 Meses" sub="Promedio acuerdo escala 1-5" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {HEATMAP_FACTORS.map((f, i) => {
                const t = Math.min(1, Math.max(0, (f.score - 3.5) / 1.5));
                const r = Math.round(255 - t * 173);
                const g = Math.round(77 + t * 119);
                const b = Math.round(79 + t * -53);
                return (
                  <motion.div key={f.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 + i * 0.02 }}
                    style={{ borderRadius: 6, padding: '4px 7px', backgroundColor: `rgb(${r},${g},${b})`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 9, color: '#fff', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={f.label}>{trunc(f.label, 28)}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{f.score.toFixed(2)}</span>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Card delay={0.15}>
            <CardTitle title="Top 5 Fortalezas" sub="Factores mejor evaluados · todos los segmentos" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {top5.map((f, i) => (
                <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#f6ffed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: C.promoter, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, color: '#595959', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={f.label}>{f.label}</div>
                    <div style={{ height: 4, background: '#f5f5f5', borderRadius: 1000, marginTop: 2 }}>
                      <div style={{ height: '100%', background: C.promoter, borderRadius: 1000, width: `${(f.score / 5) * 100}%` }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.promoter, flexShrink: 0 }}>{f.score.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card delay={0.2}>
            <CardTitle title="Top 5 Áreas a Mejorar" sub="Factores con menor evaluación · todos los segmentos" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {bottom5.map((f, i) => (
                <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff1f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: C.detractor, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, color: '#595959', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={f.label}>{f.label}</div>
                    <div style={{ height: 4, background: '#f5f5f5', borderRadius: 1000, marginTop: 2 }}>
                      <div style={{ height: '100%', background: C.detractor, borderRadius: 1000, width: `${(f.score / 5) * 100}%`, opacity: 0.7 }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.detractor, flexShrink: 0 }}>{f.score.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECCIÓN 4: VOZ DEL COLABORADOR
      ══════════════════════════════════════════════════ */}
      <section>
        <SectionHeader
          title="Voz del Colaborador"
          subtitle="¿Qué dicen? · Análisis de comentarios abiertos"
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 10, marginBottom: 10 }}>
          <Card delay={0.05}>
            <CardTitle title="Temas Frecuentes" sub={`${totalComments} comentarios analizados`} />
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={data.themes} layout="vertical" margin={{ top: 0, right: 28, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 9, fill: '#bfbfbf' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="tema" width={80} tick={{ fontSize: 11, fill: '#595959' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Menciones" radius={[0, 6, 6, 0]} maxBarSize={18}
                  label={{ position: 'right', fontSize: 10, fill: '#8c8c8c' }}>
                  {data.themes.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card delay={0.1}>
            <CardTitle title="Distribución de Sentimiento" sub="En comentarios abiertos" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {sentimentOrder.map(sent => {
                const found = data.sentiments.find(s => s.sentimiento === sent);
                if (!found) return null;
                const pct = Math.round(found.count / totalComments * 100);
                const color = SENTIMENT_COLORS[sent];
                return (
                  <div key={sent}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: '#595959' }}>{sent}</span>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color }}>{pct}%</span>
                    </div>
                    <ProgressBar pct={pct} color={color} delay={0.15} />
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Temas tile map */}
        <Card delay={0.15} style={{ marginBottom: 10 }}>
          <CardTitle title="Mapa de Temas" sub="Tamaño proporcional a frecuencia de menciones" />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {data.themes.map((item, i) => {
              const pct = Math.round(item.count / totalComments * 100);
              return (
                <motion.div key={item.tema}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.04 }}
                  whileHover={{ scale: 1.04 }}
                  style={{
                    flex: `${item.count} 0 auto`,
                    minWidth: 80,
                    maxWidth: 180,
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: PALETTE[i % PALETTE.length],
                    color: '#fff',
                    cursor: 'default',
                  }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{item.tema}</div>
                  <div style={{ fontSize: 10, opacity: 0.85 }}>{item.count} · {pct}%</div>
                </motion.div>
              );
            })}
          </div>
        </Card>

        {/* Comments */}
        <Card delay={0.2}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
            <CardTitle title="Comentarios Verbatim" sub={`Mostrando ${filteredComments.length} de ${totalComments}`} />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Select placeholder="Grupo" allowClear size="small" style={{ width: 120 }}
                onChange={v => setCommentSource(v || null)}
                options={[
                  { value: 'Ex Colaboradores', label: 'Ex Colab.' },
                  { value: '0-6 Meses', label: '0-6 Meses' },
                  { value: '+6 Meses', label: '+6 Meses' },
                ]} />
              <Select placeholder="Sentimiento" allowClear size="small" style={{ width: 130 }}
                onChange={v => setCommentSent(v || null)}
                options={sentimentOrder.map(s => ({ value: s, label: s }))} />
            </div>
          </div>
          <Search placeholder="Buscar en comentarios..." onChange={e => setCommentSearch(e.target.value)}
            style={{ marginBottom: 10 }} size="small" allowClear />
          <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 7 }}>
            <AnimatePresence>
              {filteredComments.slice(0, 40).map((c, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.015 }}
                  style={{
                    padding: '9px 12px',
                    background: '#fafafa',
                    borderRadius: 8,
                    border: '1px solid #f0f0f0',
                    borderLeft: `3px solid ${SENTIMENT_COLORS[c.sentimiento] || '#d9d9d9'}`,
                  }}>
                  <div style={{ display: 'flex', gap: 5, marginBottom: 5, flexWrap: 'wrap' }}>
                    <Tag color={ENPS_COLORS[c.enps_cat] || 'default'} style={{ fontSize: 10, borderRadius: 1000, margin: 0 }}>{c.enps_cat}</Tag>
                    <Tag color="blue" style={{ fontSize: 10, borderRadius: 1000, margin: 0 }}>{c.source}</Tag>
                    {c.tema && <Tag style={{ fontSize: 10, borderRadius: 1000, margin: 0 }}>{c.tema}</Tag>}
                    {c.sentimiento && (
                      <Tag style={{ fontSize: 10, borderRadius: 1000, margin: 0, background: `${SENTIMENT_COLORS[c.sentimiento]}22`, borderColor: SENTIMENT_COLORS[c.sentimiento], color: SENTIMENT_COLORS[c.sentimiento] }}>
                        {c.sentimiento}
                      </Tag>
                    )}
                  </div>
                  <p style={{ fontSize: 11, color: '#595959', margin: 0, lineHeight: 1.5 }}>{c.comment}</p>
                  {c.area && <div style={{ fontSize: 9, color: '#bfbfbf', marginTop: 3 }}>📍 {c.area}</div>}
                </motion.div>
              ))}
            </AnimatePresence>
            {filteredComments.length === 0 && (
              <div style={{ textAlign: 'center', padding: '28px 0', color: '#bfbfbf', fontSize: 12 }}>Sin resultados</div>
            )}
          </div>
        </Card>
      </section>

      {/* ══════════════════════════════════════════════════
          SECCIÓN 5: EX COLABORADORES
      ══════════════════════════════════════════════════ */}
      <section>
        <SectionHeader
          title="Ex Colaboradores · Proceso de Salida"
          subtitle="¿Qué dejó a los colaboradores en la salida y qué podría haberse hecho diferente?"
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 10 }}>
          {[
            { title: 'eNPS · Ex Colaboradores', value: data.summary.ex.enps, sub: 'Escala -100 a 100', color: C.pink },
            { title: 'Total Encuestados', value: data.summary.ex.total, sub: 'Ex colaboradores', color: '#595959' },
            { title: '% Promotores', value: `${data.summary.ex.pct_promoters}%`, sub: `${data.summary.ex.promoters} personas`, color: C.promoter },
            { title: '% Detractores', value: `${data.summary.ex.pct_detractors}%`, sub: `${data.summary.ex.detractors} personas`, color: C.detractor },
          ].map((kpi, i) => (
            <Card key={kpi.title} delay={i * 0.05}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{kpi.title}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: kpi.color, lineHeight: 1 }}>{kpi.value}</div>
              <div style={{ fontSize: 10, color: '#8c8c8c', marginTop: 4 }}>{kpi.sub}</div>
            </Card>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Card delay={0.2}>
            <CardTitle title="Evaluación del Proceso de Salida" sub="Promedio de acuerdo escala 1-5" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(data.factors.ex.all as { label: string; score: number }[]).map((f, i) => (
                <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, color: '#595959', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={f.label}>{trunc(f.label, 44)}</div>
                    <div style={{ height: 5, background: '#f5f5f5', borderRadius: 1000, marginTop: 2 }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(f.score / 5) * 100}%` }}
                        transition={{ duration: 0.7, delay: 0.25 + i * 0.05 }}
                        style={{ height: '100%', background: f.score >= 4 ? C.promoter : C.primary, borderRadius: 1000 }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: f.score >= 4 ? C.promoter : C.primary, flexShrink: 0 }}>{f.score.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card delay={0.25}>
            <CardTitle title="¿Cómo podría haberse evitado la desvinculación?" sub="Temas en respuestas abiertas" />
            {((data as any).ex_exit.themes as { tema: string; count: number }[]).length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={(data as any).ex_exit.themes} margin={{ top: 4, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="tema" tick={{ fontSize: 10, fill: '#595959' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#bfbfbf' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Menciones" radius={[6, 6, 0, 0]} maxBarSize={44}
                    label={{ position: 'top', fontSize: 10, fill: '#8c8c8c' }}>
                    {((data as any).ex_exit.themes as any[]).map((_: any, i: number) => (
                      <Cell key={i} fill={`hsl(${330 + i * 30}, 65%, ${58 + i * 5}%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ padding: '24px 0', textAlign: 'center', color: '#bfbfbf', fontSize: 12 }}>Sin datos disponibles</div>
            )}
          </Card>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECCIÓN 6: BENCHMARK INTERNO
      ══════════════════════════════════════════════════ */}
      <section>
        <SectionHeader
          title="Benchmark Interno"
          subtitle="¿Cómo se comparan los distintos segmentos entre sí?"
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 10 }}>
          <Card delay={0.05}>
            <CardTitle title="Comparación eNPS por Segmento" sub="Tipo de colaborador" />
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={byType} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="type" tick={{ fontSize: 9, fill: '#595959' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#bfbfbf' }} axisLine={false} tickLine={false} domain={[0, 80]} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="enps" name="eNPS" radius={[6, 6, 0, 0]} maxBarSize={54}
                  label={{ position: 'top', fontSize: 11, fontWeight: 700, fill: '#1a1a2e' }}>
                  {byType.map((_, i) => <Cell key={i} fill={PALETTE[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card delay={0.1}>
            <CardTitle title="Por Género" sub="Distribución de participantes" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.demographics.gender.map((g, i) => {
                const total = data.demographics.gender.reduce((a, b) => a + b.value, 0);
                const pct = Math.round(g.value / total * 100);
                return (
                  <div key={g.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: '#595959' }}>{g.label || 'N/A'}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: PALETTE[i] }}>{pct}% ({g.value})</span>
                    </div>
                    <ProgressBar pct={pct} color={PALETTE[i]} delay={0.15 + i * 0.05} />
                  </div>
                );
              })}
            </div>
          </Card>

          <Card delay={0.15}>
            <CardTitle title="Top Áreas" sub="Participantes por área" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {data.demographics.area.slice(0, 6).map((a, i) => {
                const total = data.demographics.area.reduce((s, x) => s + x.value, 0);
                const pct = Math.round(a.value / total * 100);
                return (
                  <div key={a.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontSize: 10, color: '#595959' }} title={a.label}>{trunc(a.label, 28)}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: PALETTE[i % PALETTE.length] }}>{pct}%</span>
                    </div>
                    <ProgressBar pct={pct} color={PALETTE[i % PALETTE.length]} delay={0.2 + i * 0.03} />
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </section>

    </div>
  );
}
