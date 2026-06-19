import HomeIcon from './icons/HomeIcon';
import avatarImg from '../assets/icons/avatar.png';

interface NavbarProps {
  currentPage?: string;
}

export default function Navbar({ currentPage = 'Dashboard VOE' }: NavbarProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: '60px',
        right: 0,
        height: '50px',
        backgroundColor: 'rgba(250, 250, 250, 0.9)',
        backdropFilter: 'blur(4px)',
        zIndex: 99,
        display: 'flex',
        alignItems: 'flex-end',
        paddingTop: '2px',
        paddingLeft: '3.67px',
        paddingRight: '14px',
      }}
    >
      {/* Inner container with bottom border */}
      <div
        style={{
          width: '100%',
          position: 'relative',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '0.8px solid #eeeeee',
        }}
      >
        {/* Left: hamburger + breadcrumb */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            minWidth: 0,
            flex: 1,
          }}
        >
          {/* Hamburger button */}
          <div
            style={{
              width: '53px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect y="4" width="20" height="2" rx="1" fill="#76838F"/>
              <rect y="9" width="15" height="2" rx="1" fill="#76838F"/>
              <rect y="14" width="10" height="2" rx="1" fill="#76838F"/>
            </svg>
          </div>

          {/* Breadcrumb pill */}
          <div
            style={{
              height: '33.6px',
              backgroundColor: '#ffffff',
              border: '1px solid #f9f9f9',
              borderRadius: '25px',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '9.8px',
              paddingRight: '12px',
              overflow: 'hidden',
              maxWidth: '100%',
            }}
          >
            {/* Home icon + label — contenedor exclusivo */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <HomeIcon />
              <span
                style={{
                  fontFamily: "'Open Sans', sans-serif",
                  fontSize: '12px',
                  color: '#22a7f0',
                  lineHeight: '24px',
                  whiteSpace: 'nowrap',
                }}
              >
                Página de Inicio
              </span>
            </div>

            {/* Separator — 8px de distancia a cada lado */}
            <span
              style={{
                fontSize: '14px',
                color: '#cccccc',
                marginLeft: '8px',
                marginRight: '8px',
                lineHeight: '18.86px',
                userSelect: 'none',
                flexShrink: 0,
              }}
            >
              ›
            </span>

            {/* Current page */}
            <span
              style={{
                fontFamily: "'Open Sans', sans-serif",
                fontSize: '12px',
                color: '#58595f',
                lineHeight: '18.86px',
                whiteSpace: 'nowrap',
              }}
            >
              {currentPage}
            </span>
          </div>
        </div>

        {/* Right: user avatar */}
        <div
          style={{
            position: 'absolute',
            right: '5px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: '#ddd',
              flexShrink: 0,
            }}
          >
            <img src={avatarImg} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          {/* Dropdown caret */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderTop: '4px solid #353d47',
            }}
          />
        </div>
      </div>
    </div>
  );
}
