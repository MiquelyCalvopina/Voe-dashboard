import AppsIcon from './icons/AppsIcon';
import {
  HomeNavIcon,
  BuildingNavIcon,
  PlayNavIcon,
  ArchiveNavIcon,
  WalletNavIcon,
  ToolsNavIcon,
} from './icons/NavIcons';
import type { PageId } from '../App';

const navItems: { icon: React.ReactNode; label: string; page: PageId }[] = [
  { icon: <HomeNavIcon />, label: 'Resumen Ejecutivo', page: 'resumen' },
  { icon: <BuildingNavIcon />, label: 'Ciclo de Vida', page: 'ciclo' },
  { icon: <PlayNavIcon />, label: 'Drivers de Satisfacción', page: 'drivers' },
  { icon: <ArchiveNavIcon />, label: 'Voz del Colaborador', page: 'voz' },
  { icon: <WalletNavIcon />, label: 'Ex Colaboradores', page: 'ex' },
  { icon: <ToolsNavIcon />, label: 'Benchmark Interno', page: 'benchmark' },
];

interface Props {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
}

export default function Sidebar({ activePage, onNavigate }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '60px',
        height: '100%',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        borderRight: '1px solid #f0f0f0',
      }}
    >
      <div
        style={{
          width: '60px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          cursor: 'pointer',
        }}
      >
        <AppsIcon />
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {navItems.map((item) => (
          <div
            key={item.page}
            title={item.label}
            onClick={() => onNavigate(item.page)}
            style={{
              width: '60px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backgroundColor: activePage === item.page ? '#e6f4ff' : 'transparent',
              borderRight: activePage === item.page ? '2px solid #1677ff' : '2px solid transparent',
              transition: 'all 0.15s ease',
            }}
          >
            {item.icon}
          </div>
        ))}
      </div>
    </div>
  );
}
