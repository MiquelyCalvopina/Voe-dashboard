import VerticalMainMenu from './components/VerticalMainMenu';
import Navbar from './components/Navbar';
import './index.css';

export default function App() {
  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      <VerticalMainMenu />
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
            marginLeft: '6px',
            marginRight: '14px',
            backgroundColor: '#ffffff',
            overflow: 'auto',
            minHeight: 0,
          }}
        />
      </div>
    </div>
  );
}
