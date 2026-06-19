import { useState } from 'react';
import { ConfigProvider } from 'antd';
import VerticalMainMenu from './components/VerticalMainMenu';
import Navbar from './components/Navbar';
import ResumenEjecutivo from './pages/ResumenEjecutivo';
import CicloDeVida from './pages/CicloDeVida';
import DriversPage from './pages/DriversPage';
import VozColaborador from './pages/VozColaborador';
import ExColaboradores from './pages/ExColaboradores';
import BenchmarkInterno from './pages/BenchmarkInterno';
import './index.css';

const theme = {
  token: {
    colorPrimary: '#1677ff',
    borderRadius: 8,
    borderRadiusLG: 8,
    borderRadiusSM: 1000,
    borderRadiusXS: 1000,
    fontFamily: "'Open Sans', sans-serif",
  },
  components: {
    Button: { borderRadius: 8, borderRadiusSM: 1000 },
    Tag: { borderRadius: 1000 },
    Badge: { borderRadius: 1000 },
    Input: { borderRadius: 8 },
    Select: { borderRadius: 8 },
    Card: { borderRadius: 8 },
    Table: { borderRadius: 8 },
    Modal: { borderRadius: 8 },
    Dropdown: { borderRadius: 8 },
  },
};

export type PageId = 'resumen' | 'ciclo' | 'drivers' | 'voz' | 'ex' | 'benchmark';

const PAGE_LABELS: Record<PageId, string> = {
  resumen: 'Resumen Ejecutivo',
  ciclo: 'Ciclo de Vida',
  drivers: 'Drivers de Satisfacción',
  voz: 'Voz del Colaborador',
  ex: 'Ex Colaboradores',
  benchmark: 'Benchmark Interno',
};

const PAGE_TABS: { id: PageId; label: string }[] = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'ciclo', label: 'Ciclo de Vida' },
  { id: 'drivers', label: 'Drivers' },
  { id: 'voz', label: 'Voz' },
  { id: 'ex', label: 'Ex Colab.' },
  { id: 'benchmark', label: 'Benchmark' },
];

function PageContent({ page }: { page: PageId }) {
  switch (page) {
    case 'resumen': return <ResumenEjecutivo />;
    case 'ciclo': return <CicloDeVida />;
    case 'drivers': return <DriversPage />;
    case 'voz': return <VozColaborador />;
    case 'ex': return <ExColaboradores />;
    case 'benchmark': return <BenchmarkInterno />;
  }
}

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('resumen');

  return (
    <ConfigProvider theme={theme}>
      <div style={{ display: 'flex', width: '100%', height: '100%' }}>
        <VerticalMainMenu activePage={activePage} onNavigate={setActivePage} />
        <div
          style={{
            paddingLeft: '60px',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
          }}
        >
          <Navbar currentPage={PAGE_LABELS[activePage]} />
          {/* Sub-navigation tabs */}
          <div
            style={{
              position: 'fixed',
              top: '50px',
              left: '60px',
              right: 0,
              height: '36px',
              backgroundColor: '#ffffff',
              borderBottom: '1px solid #f0f0f0',
              zIndex: 98,
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '16px',
              gap: 2,
            }}
          >
            {PAGE_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActivePage(tab.id)}
                style={{
                  height: '28px',
                  padding: '0 12px',
                  fontSize: '11px',
                  fontWeight: activePage === tab.id ? 700 : 500,
                  color: activePage === tab.id ? '#1677ff' : '#8c8c8c',
                  backgroundColor: activePage === tab.id ? '#e6f4ff' : 'transparent',
                  border: 'none',
                  borderRadius: 1000,
                  cursor: 'pointer',
                  fontFamily: "'Open Sans', sans-serif",
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <main
            style={{
              flex: 1,
              marginTop: '86px',
              marginLeft: '6px',
              marginRight: '14px',
              backgroundColor: '#ffffff',
              overflow: 'auto',
              minHeight: 0,
              paddingBottom: '16px',
            }}
          >
            <PageContent page={activePage} />
          </main>
        </div>
      </div>
    </ConfigProvider>
  );
}
