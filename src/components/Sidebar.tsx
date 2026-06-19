import AppsIcon from './icons/AppsIcon';
import {
  HomeNavIcon,
  InboxNavIcon,
  PlayNavIcon,
  CalendarNavIcon,
  ListNavIcon,
  ToolsNavIcon,
} from './icons/NavIcons';

const navItems = [
  { icon: <HomeNavIcon />, label: 'Inicio' },
  { icon: <InboxNavIcon />, label: 'Bandeja' },
  { icon: <PlayNavIcon />, label: 'Media' },
  { icon: <CalendarNavIcon />, label: 'Calendario' },
  { icon: <ListNavIcon />, label: 'Listas' },
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
      {/* Apps button - top */}
      <div
        style={{
          width: '60px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderTopLeftRadius: '10px',
          flexShrink: 0,
          cursor: 'pointer',
        }}
      >
        <AppsIcon />
      </div>

      {/* Navigation icons */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '2px',
          overflow: 'hidden',
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
              overflow: 'hidden',
            }}
          >
            {item.icon}
          </div>
        ))}
      </div>
    </div>
  );
}
