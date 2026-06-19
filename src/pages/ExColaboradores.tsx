import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { Tag } from 'antd';
import KPICard from '../components/dashboard/KPICard';
import ChartCard from '../components/dashboard/ChartCard';
import data from '../data/dashboardData.json';

const COLORS = {
  primary: '#eb2f96',
  promoter: '#52c41a',
  detractor: '#ff4d4f',
  neutral: '#faad14',
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

const ex = data.summary.ex;
const exFactors = data.factors.ex.all as { label: string; score: number }[];
const exitThemes = (data as any).ex_exit.themes as { tema: string; count: number }[];
const exitComments = (data as any).ex_exit.comments as { comment: string; tema: string; sentimiento: string; area: string; enps_cat: string }[];

const processFactors = exFactors.slice().sort((a, b) => a.score - b.score);

export default function ExColaboradores() {
  return (
    <div style={{ padding: '18px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <KPICard title="eNPS Ex Colaboradores" value={ex.enps} subtitle="Escala -100 a 100" color={COLORS.primary} bg="#fff0f6" delay={0} />
        <KPICard title="Total Encuestados" value={ex.total} subtitle="Ex colaboradores" color="#595959" bg="#f5f5f5" delay={0.05} />
        <KPICard title="% Promotores" value={`${ex.pct_promoters}%`} subtitle={`${ex.promoters} personas`} color={COLORS.promoter} bg="#f6ffed" delay={0.1} />
        <KPICard title="% Detractores" value={`${ex.pct_detractors}%`} subtitle={`${ex.detractors} personas`} color={COLORS.detractor} bg="#fff1f0" delay={0.15} />
      </div>

      {/* Distribution + Process factors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 12 }}>

        {/* eNPS distribution */}
        <ChartCard title="Distribución eNPS · Ex Colaboradores" subtitle="Composición del grupo" delay={0.2} height={200}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            {[
              { label: 'Promotores', pct: ex.pct_promoters, count: ex.promoters, color: COLORS.promoter },
              { label: 'Neutros', pct: ex.pct_neutrals, count: ex.neutrals, color: COLORS.neutral },
              { label: 'Detractores', pct: ex.pct_detractors, count: ex.detractors, color: COLORS.detractor },
            ].map(item => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: '#595959' }}>{item.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.pct}% ({item.count})</span>
                </div>
                <div style={{ height: 10, backgroundColor: '#f5f5f5', borderRadius: 1000 }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.pct}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    style={{ height: '100%', backgroundColor: item.color, borderRadius: 1000 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Process evaluation */}
        <ChartCard title="Evaluación del Proceso de Salida" subtitle="Promedio de acuerdo escala 1-5" delay={0.25}>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={processFactors.map(f => ({ ...f, label: f.label.length > 35 ? f.label.slice(0, 35) + '…' : f.label }))} layout="vertical" margin={{ top: 0, right: 50, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" domain={[3, 5]} tick={{ fontSize: 10, fill: '#bfbfbf' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="label" width={155} tick={{ fontSize: 10, fill: '#595959' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: any) => [v.toFixed(2), 'Promedio']} />
              <Bar dataKey="score" radius={[0, 6, 6, 0]} maxBarSize={14}
                label={{ position: 'right', fontSize: 10, fill: '#595959' }}>
                {processFactors.map((f, i) => (
                  <Cell key={i} fill={f.score >= 4 ? COLORS.promoter : f.score >= 3.8 ? '#1677ff' : COLORS.neutral} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Exit prevention themes */}
      {exitThemes.length > 0 && (
        <ChartCard title="¿Cómo Podría Haberse Evitado la Desvinculación?" subtitle="Temas identificados en respuestas abiertas" delay={0.3}>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={exitThemes} margin={{ top: 0, right: 30, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="tema" tick={{ fontSize: 11, fill: '#595959' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#bfbfbf' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: any) => [v, 'Menciones']} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40} label={{ position: 'top', fontSize: 10, fill: '#595959' }}>
                {exitThemes.map((_, i) => (
                  <Cell key={i} fill={`hsl(${330 + i * 30}, 70%, ${55 + i * 5}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Exit comments */}
      {exitComments.length > 0 && (
        <ChartCard title="Comentarios de Desvinculación" subtitle={`${exitComments.length} respuestas sobre cómo evitar la salida`} delay={0.4}>
          <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {exitComments.slice(0, 20).map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 + i * 0.02 }}
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#fafafa',
                  borderRadius: 8,
                  border: '1px solid #f0f0f0',
                  borderLeft: `3px solid ${SENTIMENT_COLORS[c.sentimiento] || '#d9d9d9'}`,
                }}
              >
                <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                  {c.enps_cat && <Tag color={ENPS_COLORS[c.enps_cat] || 'default'} style={{ fontSize: 10, borderRadius: 1000 }}>{c.enps_cat}</Tag>}
                  {c.tema && <Tag style={{ fontSize: 10, borderRadius: 1000 }}>{c.tema}</Tag>}
                  {c.sentimiento && <Tag style={{ fontSize: 10, borderRadius: 1000, backgroundColor: `${SENTIMENT_COLORS[c.sentimiento]}22`, borderColor: SENTIMENT_COLORS[c.sentimiento], color: SENTIMENT_COLORS[c.sentimiento] }}>{c.sentimiento}</Tag>}
                </div>
                <p style={{ fontSize: 12, color: '#595959', margin: 0, lineHeight: 1.5 }}>{c.comment}</p>
                {c.area && <div style={{ fontSize: 10, color: '#bfbfbf', marginTop: 4 }}>📍 {c.area}</div>}
              </motion.div>
            ))}
          </div>
        </ChartCard>
      )}
    </div>
  );
}
