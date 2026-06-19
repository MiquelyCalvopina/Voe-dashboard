import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import './index.css';

export default function App() {
  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      <Sidebar />
      {/*
        El sidebar es position:fixed (fuera del flujo normal).
        paddingLeft compensa su ancho para que el contenido no quede debajo.
      */}
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
        <Navbar />
        <main
          style={{
            flex: 1,
            marginTop: '50px',
            backgroundColor: '#ffffff',
            overflow: 'auto',
            minHeight: 0,
          }}
        />
      </div>
    </div>
  );
}
