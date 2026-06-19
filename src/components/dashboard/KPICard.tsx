import { motion } from 'framer-motion';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  bg?: string;
  icon?: React.ReactNode;
  trend?: number;
  delay?: number;
}

export default function KPICard({ title, value, subtitle, color = '#1677ff', bg = '#f0f7ff', icon, trend, delay = 0 }: KPICardProps) {
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
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {title}
        </span>
        {icon && (
          <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </div>
        )}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1.2 }}>
        {value}
      </div>
      {subtitle && (
        <span style={{ fontSize: 11, color: '#8c8c8c' }}>{subtitle}</span>
      )}
      {trend !== undefined && (
        <span style={{ fontSize: 11, color: trend >= 0 ? '#52c41a' : '#ff4d4f', fontWeight: 600 }}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </motion.div>
  );
}
