import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import './index.css';

export default function App() {
  return (
    <div
      style={{
        width: '100vw',
        minHeight: '100vh',
        backgroundColor: '#f9f9f9',
        position: 'relative',
      }}
    >
      <Sidebar />
      <Navbar />
      <div
        style={{
          marginLeft: '60px',
          marginTop: '50px',
          minHeight: 'calc(100vh - 50px)',
          backgroundColor: '#ffffff',
        }}
      />
    </div>
  );
}
