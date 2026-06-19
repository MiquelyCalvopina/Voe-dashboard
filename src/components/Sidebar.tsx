import AppsIcon from './icons/AppsIcon';
import {
  HomeNavIcon,
  BuildingNavIcon,
  PlayNavIcon,
  ArchiveNavIcon,
  WalletNavIcon,
  ToolsNavIcon,
} from './icons/NavIcons';

const navItems = [
  { icon: <HomeNavIcon />, label: 'Inicio' },
  { icon: <BuildingNavIcon />, label: 'Estudios' },
  { icon: <PlayNavIcon />, label: 'Media' },
  { icon: <ArchiveNavIcon />, label: 'Archivo' },
  { icon: <WalletNavIcon />, label: 'Cartera' },
  { icon: <ToolsNavIcon />, label: 'Herramientas' },
];

export default function Sidebar() {
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
          paddingTop: '2px',
        }}
      >
        {navItems.map((item, i) => (
          <div
            key={i}
            title={item.label}
            style={{
              width: '55px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {item.icon}
          </div>
        ))}
      </div>
    </div>
  );
}
