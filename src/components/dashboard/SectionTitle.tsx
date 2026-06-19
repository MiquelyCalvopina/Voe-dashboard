interface SectionTitleProps {
  title: string;
  subtitle?: string;
}

export default function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <div style={{ marginBottom: 12 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>{title}</h3>
      {subtitle && <p style={{ fontSize: 11, color: '#8c8c8c', margin: '2px 0 0' }}>{subtitle}</p>}
    </div>
  );
}
