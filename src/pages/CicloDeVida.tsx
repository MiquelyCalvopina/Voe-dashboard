import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import ChartCard from '../components/dashboard/ChartCard';
import KPICard from '../components/dashboard/KPICard';
import data from '../data/dashboardData.json';

const COLORS = {
  new06: '#1677ff',
  senior: '#722ed1',
  ex: '#eb2f96',
  promoter: '#52c41a',
  detractor: '#ff4d4f',
};

const STAGE_CONFIG = [
  {
    key: 'Selección & Contratación',
    icon: '🎯',
    color: COLORS.new06,
    bg: '#e6f4ff',
    source: 'new06' as const,
    desc: '0-6 meses · Reclutamiento',
    factorFilter: (k: string) => ['prueba', 'médic', 'anuncio', 'llamada', 'evaluacion', 'documentos', 'kit', 'computador'].some(kw => k.toLowerCase().includes(kw)),
  },
  {
    key: 'Onboarding',
    icon: '🚀',
    color: '#13c2c2',
    bg: '#e6fffb',
    source: 'new06' as const,
    desc: '0-6 meses · Incorporación',
    factorFilter: (k: string) => ['induc', 'kit', 'computador', 'acceso', 'bienvenida', 'medir'].some(kw => k.toLowerCase().includes(kw)),
  },
  {
    key: 'Día a Día',
    icon: '💼',
    color: COLORS.senior,
    bg: '#f9f0ff',
    source: 'senior' as const,
    desc: '+6 meses · Trabajo cotidiano',
    factorFilter: (k: string) => ['herramienta', 'equipo', 'instalac', 'red', 'internet', 'cotidian'].some(kw => k.toLowerCase().includes(kw)),
  },
  {
    key: 'Desarrollo',
    icon: '📈',
    color: '#fa8c16',
    bg: '#fff7e6',
    source: 'senior' as const,
    desc: '+6 meses · Crecimiento',
    factorFilter: (k: string) => ['carrera', 'capacit', 'desempeño', 'retroalim', 'desarrollo', 'evaluac'].some(kw => k.toLowerCase().includes(kw)),
  },
  {
    key: 'Proceso de Salida',
    icon: '🔄',
    color: COLORS.ex,
    bg: '#fff0f6',
    source: 'ex' as const,
    desc: 'Ex colaboradores',
    factorFilter: () => true,
  },
];

function StageCard({ stage, index }: { stage: typeof STAGE_CONFIG[0]; index: number }) {
  const factors = (data.factors[stage.source].all as { label: string; score: number }[])
    .filter(f => stage.factorFilter(f.label))
    .slice(0, 4);

  const enps = data.summary[stage.source === 'new06' ? 'new06' : stage.source === 'senior' ? 'senior' : 'ex'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      style={{
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: '16px 18px',
        border: `1px solid ${stage.color}22`,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: stage.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
          {stage.icon}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>{stage.key}</div>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>{stage.desc}</div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: stage.color }}>{enps.enps}</div>
          <div style={{ fontSize: 10, color: '#8c8c8c' }}>eNPS</div>
        </div>
      </div>
      {factors.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {factors.map(f => (
            <div key={f.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontSize: 10, color: '#595959', flex: 1, paddingRight: 8 }} title={f.label}>
                  {f.label.length > 42 ? f.label.slice(0, 42) + '…' : f.label}
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, color: stage.color, flexShrink: 0 }}>{f.score.toFixed(2)}</span>
              </div>
              <div style={{ height: 5, backgroundColor: '#f5f5f5', borderRadius: 1000 }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(f.score / 5) * 100}%` }}
                  transition={{ duration: 0.7, delay: 0.3 + index * 0.08 }}
                  style={{ height: '100%', backgroundColor: stage.color, borderRadius: 1000, opacity: 0.8 }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}


export default function CicloDeVida() {
  return (
    <div style={{ padding: '18px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <KPICard title="eNPS · 0-6 Meses" value={data.summary.new06.enps} subtitle={`${data.summary.new06.total} participantes`} color={COLORS.new06} bg="#e6f4ff" delay={0} />
        <KPICard title="eNPS · +6 Meses" value={data.summary.senior.enps} subtitle={`${data.summary.senior.total} participantes`} color={COLORS.senior} bg="#f9f0ff" delay={0.05} />
        <KPICard title="eNPS · Ex Colaboradores" value={data.summary.ex.enps} subtitle={`${data.summary.ex.total} participantes`} color={COLORS.ex} bg="#fff0f6" delay={0.1} />
      </div>

      {/* Stage cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {STAGE_CONFIG.slice(0, 3).map((stage, i) => (
          <StageCard key={stage.key} stage={stage} index={i} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {STAGE_CONFIG.slice(3).map((stage, i) => (
          <StageCard key={stage.key} stage={stage} index={i + 3} />
        ))}
      </div>

      {/* Comparison chart */}
      <ChartCard title="Comparación de eNPS por Etapa del Ciclo de Vida" subtitle="Score eNPS general por grupo" delay={0.4}>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart
            data={[
              { etapa: 'Selección & Contratación', score: data.summary.new06.enps, fill: COLORS.new06 },
              { etapa: 'Onboarding', score: data.summary.new06.enps, fill: '#13c2c2' },
              { etapa: 'Día a Día & Desarrollo', score: data.summary.senior.enps, fill: COLORS.senior },
              { etapa: 'Proceso de Salida', score: data.summary.ex.enps, fill: COLORS.ex },
            ]}
            margin={{ top: 0, right: 8, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="etapa" tick={{ fontSize: 10, fill: '#595959' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#bfbfbf' }} axisLine={false} tickLine={false} domain={[0, 80]} />
            <Tooltip formatter={(v: any) => [v, 'eNPS']} />
            <Bar dataKey="score" radius={[8, 8, 0, 0]} maxBarSize={60}>
              {[COLORS.new06, '#13c2c2', COLORS.senior, COLORS.ex].map((color, i) => (
                <Cell key={i} fill={color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
