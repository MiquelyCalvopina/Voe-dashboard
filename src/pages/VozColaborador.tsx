import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, Tag, Input } from 'antd';
import ChartCard from '../components/dashboard/ChartCard';
import data from '../data/dashboardData.json';

const { Search } = Input;

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

type Comment = typeof data.comments[0];

export default function VozColaborador() {
  const [search, setSearch] = useState('');
  const [filterSource, setFilterSource] = useState<string | null>(null);
  const [filterSentimiento, setFilterSentimiento] = useState<string | null>(null);
  const [filterTema, setFilterTema] = useState<string | null>(null);

  const comments: Comment[] = data.comments;

  const filtered = comments.filter(c => {
    if (filterSource && c.source !== filterSource) return false;
    if (filterSentimiento && c.sentimiento !== filterSentimiento) return false;
    if (filterTema && c.tema !== filterTema) return false;
    if (search && !c.comment.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const themes = data.themes;

  const treemapItems = themes.map((t, i) => ({
    ...t,
    color: `hsl(${200 + i * 25}, 70%, ${50 + i * 4}%)`,
    pct: Math.round(t.count / themes.reduce((a, b) => a + b.count, 0) * 100),
  }));

  const totalComments = comments.length;
  const sentimentOrder = ['Muy positivo', 'Positivo', 'Neutral', 'Negativo', 'Muy negativo'];

  return (
    <div style={{ padding: '18px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Themes bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 12 }}>
        <ChartCard title="Temas Frecuentes en Comentarios" subtitle={`${totalComments} comentarios analizados`} delay={0}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={themes} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#bfbfbf' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="tema" width={90} tick={{ fontSize: 11, fill: '#595959' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: any) => [v, 'Menciones']} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={16} label={{ position: 'right', fontSize: 10, fill: '#595959' }}>
                {themes.map((_, i) => (
                  <Cell key={i} fill={`hsl(${200 + i * 25}, 70%, ${50 + i * 4}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Sentiment donut-like */}
        <ChartCard title="Distribución de Sentimiento" subtitle="En comentarios abiertos" delay={0.1}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            {sentimentOrder.map(sent => {
              const found = data.sentiments.find(s => s.sentimiento === sent);
              if (!found) return null;
              const pct = Math.round(found.count / totalComments * 100);
              const color = SENTIMENT_COLORS[sent];
              return (
                <div key={sent} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: '#595959', flex: 1 }}>{sent}</span>
                  <div style={{ flex: 2, height: 8, backgroundColor: '#f5f5f5', borderRadius: 1000 }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, delay: 0.2 }}
                      style={{ height: '100%', backgroundColor: color, borderRadius: 1000 }}
                    />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color, width: 32, textAlign: 'right' }}>{pct}%</span>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 12, padding: '8px 12px', backgroundColor: '#fafafa', borderRadius: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: '#8c8c8c' }}>Sentimiento positivo combinado</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#52c41a' }}>
              {Math.round((data.sentiments.filter(s => s.sentimiento.includes('positivo') || s.sentimiento === 'Positivo' || s.sentimiento === 'Muy positivo').reduce((a, b) => a + b.count, 0) / totalComments) * 100)}%
            </span>
          </div>
        </ChartCard>
      </div>

      {/* Treemap alternative — tile grid */}
      <ChartCard title="Mapa de Temas" subtitle="Tamaño proporcional a frecuencia de menciones" delay={0.2}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '4px 0' }}>
          {treemapItems.map((item, i) => (
            <motion.div
              key={item.tema}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 + i * 0.04 }}
              style={{
                backgroundColor: item.color,
                borderRadius: 10,
                padding: '12px 16px',
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                flex: `${item.count} 1 auto`,
                minWidth: 80,
                maxWidth: 200,
                cursor: 'pointer',
              }}
              whileHover={{ scale: 1.03 }}
              onClick={() => setFilterTema(filterTema === item.tema ? null : item.tema)}
            >
              <span style={{ fontSize: 13, fontWeight: 700 }}>{item.tema}</span>
              <span style={{ fontSize: 11, opacity: 0.85 }}>{item.count} menciones · {item.pct}%</span>
            </motion.div>
          ))}
        </div>
      </ChartCard>

      {/* Comments table */}
      <ChartCard
        title="Comentarios Verbatim"
        subtitle={`Mostrando ${filtered.length} de ${totalComments} comentarios`}
        delay={0.3}
        extra={
          <div style={{ display: 'flex', gap: 8 }}>
            <Select
              placeholder="Grupo"
              allowClear
              size="small"
              style={{ width: 120, fontSize: 11 }}
              onChange={v => setFilterSource(v || null)}
              options={[
                { value: 'Ex Colaboradores', label: 'Ex Colab.' },
                { value: '0-6 Meses', label: '0-6 Meses' },
                { value: '+6 Meses', label: '+6 Meses' },
              ]}
            />
            <Select
              placeholder="Sentimiento"
              allowClear
              size="small"
              style={{ width: 120, fontSize: 11 }}
              onChange={v => setFilterSentimiento(v || null)}
              options={sentimentOrder.map(s => ({ value: s, label: s }))}
            />
            <Select
              placeholder="Tema"
              allowClear
              size="small"
              style={{ width: 100, fontSize: 11 }}
              onChange={v => setFilterTema(v || null)}
              value={filterTema}
              options={data.themes.map(t => ({ value: t.tema, label: t.tema }))}
            />
          </div>
        }
      >
        <Search
          placeholder="Buscar en comentarios..."
          onChange={e => setSearch(e.target.value)}
          style={{ marginBottom: 12 }}
          size="small"
          allowClear
        />
        <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <AnimatePresence>
            {filtered.slice(0, 50).map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.02 }}
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#fafafa',
                  borderRadius: 8,
                  border: '1px solid #f0f0f0',
                  borderLeft: `3px solid ${SENTIMENT_COLORS[c.sentimiento] || '#d9d9d9'}`,
                }}
              >
                <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                  <Tag color={ENPS_COLORS[c.enps_cat] || 'default'} style={{ fontSize: 10, borderRadius: 1000 }}>{c.enps_cat}</Tag>
                  <Tag color="blue" style={{ fontSize: 10, borderRadius: 1000 }}>{c.source}</Tag>
                  {c.tema && <Tag style={{ fontSize: 10, borderRadius: 1000 }}>{c.tema}</Tag>}
                  {c.sentimiento && <Tag color={SENTIMENT_COLORS[c.sentimiento] ? undefined : 'default'} style={{ fontSize: 10, borderRadius: 1000, backgroundColor: `${SENTIMENT_COLORS[c.sentimiento]}22`, borderColor: SENTIMENT_COLORS[c.sentimiento], color: SENTIMENT_COLORS[c.sentimiento] }}>{c.sentimiento}</Tag>}
                </div>
                <p style={{ fontSize: 12, color: '#595959', margin: 0, lineHeight: 1.5 }}>{c.comment}</p>
                {c.area && <div style={{ fontSize: 10, color: '#bfbfbf', marginTop: 4 }}>📍 {c.area}</div>}
              </motion.div>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#bfbfbf', fontSize: 13 }}>
              No se encontraron comentarios con los filtros seleccionados
            </div>
          )}
        </div>
      </ChartCard>
    </div>
  );
}
