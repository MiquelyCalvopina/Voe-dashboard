import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import './index.css';

export default function App() {
  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', backgroundColor: '#f9f9f9' }}>
      {/* Sidebar fijo izquierdo */}
      <Sidebar />

      {/* Columna derecha: navbar + contenido */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, marginLeft: '60px', height: '100%', overflow: 'hidden' }}>
        <Navbar />
        <main
          style={{
            flex: 1,
            marginTop: '50px',
            backgroundColor: '#ffffff',
            overflow: 'auto',
          }}
        />
      </div>
    </div>
  );
}
