import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts';
import { Select } from 'antd';
import { motion } from 'framer-motion';
import ChartCard from '../components/dashboard/ChartCard';
import KPICard from '../components/dashboard/KPICard';
import data from '../data/dashboardData.json';

type FilterKey = 'source' | 'genero';

const COLORS = ['#1677ff', '#52c41a', '#eb2f96', '#fa8c16', '#722ed1', '#13c2c2', '#f5222d', '#a0d911'];

function getSegmentStats(filterKey: FilterKey, filterValue: string) {
  type CommentRow = typeof data.comments[0];
  const rows: CommentRow[] = data.comments;
  const filtered = filterValue === 'Todos' ? rows : rows.filter(r => r[filterKey] === filterValue);

  const enps_key = 'enps_cat';
  const promoters = filtered.filter(r => r[enps_key] === 'Promotor').length;
  const detractors = filtered.filter(r => r[enps_key] === 'Detractor').length;
  const total = filtered.length;
  if (total === 0) return null;
  return {
    total,
    enps: Math.round((promoters / total - detractors / total) * 100),
    pct_promoters: Math.round(promoters / total * 100),
    pct_detractors: Math.round(detractors / total * 100),
    pct_neutrals: Math.round((total - promoters - detractors) / total * 100),
  };
}

export default function BenchmarkInterno() {
  const [groupBy, setGroupBy] = useState<FilterKey>('source');

  const groups: Record<string, string[]> = {
    source: ['Ex Colaboradores', '0-6 Meses', '+6 Meses'],
    genero: ['Femenino', 'Masculino'],
  };

  const currentGroups = groups[groupBy];

  const comparisonData = currentGroups.map((g, i) => {
    const stats = getSegmentStats(groupBy, g);
    return {
      name: g,
      enps: stats?.enps || 0,
      promotores: stats?.pct_promoters || 0,
      detractores: stats?.pct_detractors || 0,
      neutros: stats?.pct_neutrals || 0,
      total: stats?.total || 0,
      fill: COLORS[i % COLORS.length],
    };
  });

  // Area breakdown
  const areaData = data.demographics.area.slice(0, 8).map((a, i) => ({
    name: a.label.length > 20 ? a.label.slice(0, 20) + '…' : a.label,
    fullName: a.label,
    participantes: a.value,
    fill: COLORS[i % COLORS.length],
  }));

  // Generation data
  const genData = data.demographics.generation.map((g, i) => ({
    name: g.label || 'N/A',
    value: g.value,
    fill: COLORS[i % COLORS.length],
  }));

  // City data
  const cityData = data.demographics.ciudad.slice(0, 6).map((c, i) => ({
    name: c.label,
    value: c.value,
    fill: COLORS[i % COLORS.length],
  }));

  return (
    <div style={{ padding: '18px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 12, color: '#595959', fontWeight: 600 }}>Agrupar por:</span>
        <Select
          value={groupBy}
          onChange={v => setGroupBy(v as FilterKey)}
          style={{ width: 160 }}
          options={[
            { value: 'source', label: 'Tipo de Colaborador' },
            { value: 'genero', label: 'Género' },
          ]}
        />
      </div>

      {/* KPI row per group */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${currentGroups.length}, 1fr)`, gap: 12 }}>
        {comparisonData.map((g, i) => (
          <KPICard
            key={g.name}
            title={g.name}
            value={g.enps}
            subtitle={`${g.total} participantes`}
            color={g.fill}
            bg={`${g.fill}18`}
            delay={i * 0.05}
          />
        ))}
      </div>

      {/* Comparison chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <ChartCard title="Comparación eNPS por Segmento" subtitle="Score eNPS por grupo seleccionado" delay={0.2}>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={comparisonData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#595959' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#bfbfbf' }} axisLine={false} tickLine={false} domain={[0, 80]} />
              <Tooltip />
              <Bar dataKey="enps" radius={[6, 6, 0, 0]} maxBarSize={50} label={{ position: 'top', fontSize: 11, fontWeight: 700 }}>
                {comparisonData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Distribución % por Categoría eNPS" subtitle="Promotores / Neutros / Detractores" delay={0.25}>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={comparisonData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#595959' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#bfbfbf' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="promotores" name="Promotores" stackId="a" fill="#52c41a" />
              <Bar dataKey="neutros" name="Neutros" stackId="a" fill="#faad14" />
              <Bar dataKey="detractores" name="Detractores" stackId="a" fill="#ff4d4f" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Demographics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 12 }}>

        <ChartCard title="Participantes por Área" subtitle="Distribución demográfica" delay={0.35}>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={areaData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#bfbfbf' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10, fill: '#595959' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="participantes" radius={[0, 6, 6, 0]} maxBarSize={14} label={{ position: 'right', fontSize: 10, fill: '#595959' }}>
                {areaData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Por Generación" subtitle="Distribución generacional" delay={0.4}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
            {genData.map(g => {
              const total = genData.reduce((a, b) => a + b.value, 0);
              const pct = Math.round(g.value / total * 100);
              return (
                <div key={g.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: 10, color: '#595959' }}>{g.name || 'N/A'}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: g.fill }}>{pct}%</span>
                  </div>
                  <div style={{ height: 6, backgroundColor: '#f5f5f5', borderRadius: 1000 }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: 0.4 }}
                      style={{ height: '100%', backgroundColor: g.fill, borderRadius: 1000 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>

        <ChartCard title="Por Ciudad" subtitle="Top ciudades" delay={0.45}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
            {cityData.map(c => {
              const total = data.demographics.ciudad.reduce((a, b) => a + b.value, 0);
              const pct = Math.round(c.value / total * 100);
              return (
                <div key={c.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: 10, color: '#595959' }}>{c.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: c.fill }}>{pct}%</span>
                  </div>
                  <div style={{ height: 6, backgroundColor: '#f5f5f5', borderRadius: 1000 }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: 0.45 }}
                      style={{ height: '100%', backgroundColor: c.fill, borderRadius: 1000 }} />
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
