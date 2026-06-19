import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import ChartCard from '../components/dashboard/ChartCard';
import data from '../data/dashboardData.json';

const PROMOTER_COLOR = '#52c41a';
const DETRACTOR_COLOR = '#ff4d4f';

// Build dumbbell/comparison data for themes
const promoterThemes = (data as any).themes_promotor as { tema: string; count: number }[];
const detractorThemes = (data as any).themes_detractor as { tema: string; count: number }[];

const allThemeNames = [...new Set([...promoterThemes.map(t => t.tema), ...detractorThemes.map(t => t.tema)])];
const comparisonData = allThemeNames.map(tema => ({
  tema,
  promotores: promoterThemes.find(t => t.tema === tema)?.count || 0,
  detractores: detractorThemes.find(t => t.tema === tema)?.count || 0,
})).sort((a, b) => (b.promotores + b.detractores) - (a.promotores + a.detractores));

// Factor heatmap data
const HEATMAP_FACTORS = [
  ...data.factors.senior.all.slice(0, 12),
];

function HeatmapCell({ value }: { value: number }) {
  const normalized = (value - 3.5) / 1.5; // 3.5..5 -> 0..1
  const r = Math.round(255 - normalized * (255 - 82));
  const g = Math.round(77 + normalized * (196 - 77));
  const b = Math.round(79 + normalized * (26 - 79));
  return (
    <div style={{
      width: '100%',
      height: 32,
      backgroundColor: `rgb(${r},${g},${b})`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 600,
      color: normalized > 0.5 ? '#fff' : '#fff',
    }}>
      {value.toFixed(2)}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: 12 }}>
        <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.fill }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DriversPage() {
  return (
    <div style={{ padding: '18px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Promotores vs Detractores themes */}
      <ChartCard
        title="Promotores vs Detractores · Temas en Comentarios"
        subtitle="Comparación de temas mencionados por cada grupo"
        delay={0}
        height="auto"
      >
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={comparisonData} margin={{ top: 0, right: 8, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="tema" tick={{ fontSize: 11, fill: '#595959' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#bfbfbf' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            <Bar dataKey="promotores" name="Promotores" fill={PROMOTER_COLOR} radius={[4, 4, 0, 0]} maxBarSize={30} />
            <Bar dataKey="detractores" name="Detractores" fill={DETRACTOR_COLOR} radius={[4, 4, 0, 0]} maxBarSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Insight cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { title: 'Principal driver positivo', value: 'Clima', subtitle: 'Mencionado por 65 promotores', color: PROMOTER_COLOR, bg: '#f6ffed' },
          { title: 'Principal driver negativo', value: 'Liderazgo', subtitle: 'Mencionado por detractores', color: DETRACTOR_COLOR, bg: '#fff1f0' },
          { title: 'Tema más frecuente', value: 'Otros/General', subtitle: '126 menciones totales', color: '#1677ff', bg: '#e6f4ff' },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: '14px 18px',
              border: `1px solid ${item.color}22`,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ fontSize: 11, color: '#8c8c8c', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{item.title}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: item.color, marginBottom: 4 }}>{item.value}</div>
            <div style={{ fontSize: 11, color: '#8c8c8c' }}>{item.subtitle}</div>
          </motion.div>
        ))}
      </div>

      {/* Heatmap */}
      <ChartCard
        title="Heatmap de Factores · Colaboradores +6 Meses"
        subtitle="Promedio de acuerdo escala 1-5 por factor"
        delay={0.3}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 8 }}>
          {HEATMAP_FACTORS.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + i * 0.03 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 3 }}
            >
              <div style={{ fontSize: 10, color: '#595959', lineHeight: 1.3 }} title={f.label}>
                {f.label.length > 40 ? f.label.slice(0, 40) + '…' : f.label}
              </div>
              <HeatmapCell value={f.score} />
            </motion.div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 10, color: '#8c8c8c' }}>Bajo</span>
          <div style={{ display: 'flex', height: 8, width: 120, borderRadius: 1000, overflow: 'hidden' }}>
            {Array.from({ length: 20 }, (_, i) => {
              const t = i / 19;
              const r = Math.round(255 - t * (255 - 82));
              const g = Math.round(77 + t * (196 - 77));
              const b = Math.round(79 + t * (26 - 79));
              return <div key={i} style={{ flex: 1, backgroundColor: `rgb(${r},${g},${b})` }} />;
            })}
          </div>
          <span style={{ fontSize: 10, color: '#8c8c8c' }}>Alto</span>
        </div>
      </ChartCard>

      {/* Factor ranking */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <ChartCard title="Factores con Mayor Brecha · +6 Meses" subtitle="Diferencia entre score esperado (5) y real" delay={0.5}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            {data.factors.senior.bottom.map((f, i) => {
              const gap = (5 - f.score).toFixed(2);
              return (
                <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#fff1f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: DETRACTOR_COLOR, flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, color: '#595959', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={f.label}>{f.label}</div>
                    <div style={{ height: 5, backgroundColor: '#f5f5f5', borderRadius: 1000, marginTop: 3 }}>
                      <div style={{ height: '100%', backgroundColor: DETRACTOR_COLOR, borderRadius: 1000, width: `${(f.score / 5) * 100}%`, opacity: 0.7 }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: DETRACTOR_COLOR, flexShrink: 0 }}>-{gap}</span>
                </div>
              );
            })}
          </div>
        </ChartCard>

        <ChartCard title="Fortalezas · Mejor Valoradas · +6 Meses" subtitle="Factores con mayor score promedio" delay={0.55}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            {data.factors.senior.top.map((f, i) => (
              <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#f6ffed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: PROMOTER_COLOR, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, color: '#595959', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={f.label}>{f.label}</div>
                  <div style={{ height: 5, backgroundColor: '#f5f5f5', borderRadius: 1000, marginTop: 3 }}>
                    <div style={{ height: '100%', backgroundColor: PROMOTER_COLOR, borderRadius: 1000, width: `${(f.score / 5) * 100}%`, opacity: 0.8 }} />
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: PROMOTER_COLOR, flexShrink: 0 }}>{f.score.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
