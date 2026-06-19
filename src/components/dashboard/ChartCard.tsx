import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  delay?: number;
  height?: number | string;
  extra?: ReactNode;
}

export default function ChartCard({ title, subtitle, children, delay = 0, height = 'auto', extra }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      style={{
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: '16px 20px',
        border: '1px solid #f0f0f0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        height,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>{title}</h3>
          {subtitle && <p style={{ fontSize: 11, color: '#8c8c8c', margin: '2px 0 0' }}>{subtitle}</p>}
        </div>
        {extra && <div>{extra}</div>}
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
    </motion.div>
  );
}
