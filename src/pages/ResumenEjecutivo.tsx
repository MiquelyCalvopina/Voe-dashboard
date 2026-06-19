import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ReferenceLine,
} from 'recharts';
import { motion } from 'framer-motion';
import KPICard from '../components/dashboard/KPICard';
import ChartCard from '../components/dashboard/ChartCard';
import data from '../data/dashboardData.json';

const COLORS = {
  promoter: '#52c41a',
  neutral: '#faad14',
  detractor: '#ff4d4f',
  primary: '#1677ff',
  primaryLight: '#e6f4ff',
};

const SENTIMENT_COLORS: Record<string, string> = {
  'Muy positivo': '#389e0d',
  'Positivo': '#52c41a',
  'Neutral': '#d4b106',
  'Negativo': '#ff7a45',
  'Muy negativo': '#f5222d',
};

const enpsDistribution = [
  { label: 'Promotores', value: data.summary.combined.pct_promoters, color: COLORS.promoter, count: data.summary.combined.promoters },
  { label: 'Neutros', value: data.summary.combined.pct_neutrals, color: COLORS.neutral, count: data.summary.combined.neutrals },
  { label: 'Detractores', value: data.summary.combined.pct_detractors, color: COLORS.detractor, count: data.summary.combined.detractors },
];

const enpsTypeData = data.enps_by_type.map(d => ({
  ...d,
  fill: d.enps >= 60 ? COLORS.promoter : d.enps >= 40 ? '#1677ff' : COLORS.neutral,
}));

// Top / bottom factors across all segments
const allFactors = [
  ...data.factors.senior.all,
  ...data.factors.new06.all,
  ...data.factors.ex.all,
];
const uniqueFactors = Object.values(
  allFactors.reduce((acc: Record<string, { label: string; score: number }>, f) => {
    if (!acc[f.label] || f.score < acc[f.label].score) acc[f.label] = f;
    return acc;
  }, {})
);
const sortedFactors = uniqueFactors.sort((a, b) => b.score - a.score);
const top5 = sortedFactors.slice(0, 5);
const bottom5 = sortedFactors.slice(-5).reverse();

function truncate(str: string, n = 45) {
  return str.length > n ? str.slice(0, n) + '…' : str;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: 12 }}>
        <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.fill || p.color }}>{p.name}: {p.value}{typeof p.value === 'number' && p.name !== 'eNPS' ? '%' : ''}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ResumenEjecutivo() {
  const combined = data.summary.combined;

  return (
    <div style={{ padding: '18px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <KPICard
          title="eNPS General"
          value={combined.enps}
          subtitle="Escala -100 a 100"
          color={combined.enps >= 50 ? '#52c41a' : '#faad14'}
          bg={combined.enps >= 50 ? '#f6ffed' : '#fffbe6'}
          delay={0}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill={combined.enps >= 50 ? '#52c41a' : '#faad14'}/></svg>}
        />
        <KPICard
          title="Total Participantes"
          value={combined.total}
          subtitle="3 grupos encuestados"
          color="#1677ff"
          bg="#e6f4ff"
          delay={0.05}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="#1677ff"/></svg>}
        />
        <KPICard
          title="% Promotores"
          value={`${combined.pct_promoters}%`}
          subtitle={`${combined.promoters} colaboradores`}
          color="#52c41a"
          bg="#f6ffed"
          delay={0.1}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" fill="#52c41a"/></svg>}
        />
        <KPICard
          title="% Detractores"
          value={`${combined.pct_detractors}%`}
          subtitle={`${combined.detractors} colaboradores`}
          color="#ff4d4f"
          bg="#fff1f0"
          delay={0.15}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" fill="#ff4d4f"/></svg>}
        />
      </div>

      {/* Charts row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 12 }}>

        {/* eNPS Distribution horizontal bar */}
        <ChartCard title="Distribución eNPS" subtitle="Composición total de respuestas" delay={0.2} height={220}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            {enpsDistribution.map((item) => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#595959' }}>{item.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.value}% <span style={{ fontWeight: 400, color: '#8c8c8c' }}>({item.count})</span></span>
                </div>
                <div style={{ height: 10, backgroundColor: '#f5f5f5', borderRadius: 1000, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                    style={{ height: '100%', backgroundColor: item.color, borderRadius: 1000 }}
                  />
                </div>
              </div>
            ))}
            {/* eNPS score display */}
            <div style={{ marginTop: 8, padding: '10px 16px', backgroundColor: '#f8fafe', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#595959' }}>Score eNPS</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: COLORS.promoter }}>{combined.enps}</span>
            </div>
          </div>
        </ChartCard>

        {/* eNPS by type - grouped bars */}
        <ChartCard title="eNPS por Tipo de Colaborador" subtitle="Comparación entre grupos encuestados" delay={0.25}>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={enpsTypeData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#595959' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#bfbfbf' }} axisLine={false} tickLine={false} domain={[0, 80]} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#d9d9d9" />
              <Bar dataKey="enps" name="eNPS" radius={[6, 6, 0, 0]} maxBarSize={50}>
                {enpsTypeData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            {enpsTypeData.map(d => (
              <div key={d.type} style={{ flex: 1, textAlign: 'center', padding: '6px 8px', backgroundColor: '#fafafa', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>{d.label}</div>
                <div style={{ fontSize: 11, color: '#595959' }}>
                  <span style={{ color: COLORS.promoter }}>P {d.pct_promoters}%</span>{' '}
                  <span style={{ color: COLORS.detractor }}>D {d.pct_detractors}%</span>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Charts row 2 - top/bottom factors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <ChartCard title="Top 5 Factores Mejor Evaluados" subtitle="Promedio escala 1-5 · todos los segmentos" delay={0.3}>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={top5.map(f => ({ ...f, label: truncate(f.label, 40) }))} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" domain={[3, 5]} tick={{ fontSize: 10, fill: '#bfbfbf' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="label" width={160} tick={{ fontSize: 10, fill: '#595959' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: any) => [v.toFixed(2), 'Promedio']} />
              <Bar dataKey="score" fill={COLORS.promoter} radius={[0, 6, 6, 0]} maxBarSize={14} label={{ position: 'right', fontSize: 10, fill: COLORS.promoter, formatter: (v: any) => (typeof v === 'number' ? v.toFixed(2) : v) }} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top 5 Factores a Mejorar" subtitle="Promedio escala 1-5 · todos los segmentos" delay={0.35}>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={bottom5.map(f => ({ ...f, label: truncate(f.label, 40) }))} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" domain={[3, 5]} tick={{ fontSize: 10, fill: '#bfbfbf' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="label" width={160} tick={{ fontSize: 10, fill: '#595959' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: any) => [v.toFixed(2), 'Promedio']} />
              <Bar dataKey="score" fill={COLORS.detractor} radius={[0, 6, 6, 0]} maxBarSize={14} label={{ position: 'right', fontSize: 10, fill: COLORS.detractor, formatter: (v: any) => (typeof v === 'number' ? v.toFixed(2) : v) }} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Themes & Sentiments row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
        <ChartCard title="Principales Temas en Comentarios" subtitle="Frecuencia por tema identificado" delay={0.4}>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={data.themes} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#bfbfbf' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="tema" width={90} tick={{ fontSize: 11, fill: '#595959' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: any) => [v, 'Menciones']} />
              <Bar dataKey="count" fill={COLORS.primary} radius={[0, 6, 6, 0]} maxBarSize={14}
                label={{ position: 'right', fontSize: 10, fill: '#595959' }}
              >
                {data.themes.map((_, i) => (
                  <Cell key={i} fill={`hsl(${210 + i * 20}, 75%, ${55 + i * 3}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Distribución de Sentimiento" subtitle="Análisis de comentarios abiertos" delay={0.45}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            {data.sentiments
              .sort((a, b) => {
                const order = ['Muy positivo', 'Positivo', 'Neutral', 'Negativo', 'Muy negativo'];
                return order.indexOf(a.sentimiento) - order.indexOf(b.sentimiento);
              })
              .map(s => {
                const total = data.sentiments.reduce((acc, x) => acc + x.count, 0);
                const pct = Math.round(s.count / total * 100);
                const color = SENTIMENT_COLORS[s.sentimiento] || '#8c8c8c';
                return (
                  <div key={s.sentimiento}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 11, color: '#595959' }}>{s.sentimiento}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color }}>{pct}%</span>
                    </div>
                    <div style={{ height: 8, backgroundColor: '#f5f5f5', borderRadius: 1000 }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, delay: 0.5 }}
                        style={{ height: '100%', backgroundColor: color, borderRadius: 1000 }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
