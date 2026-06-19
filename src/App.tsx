import { ConfigProvider } from 'antd';
import VerticalMainMenu from './components/VerticalMainMenu';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
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

export default function App() {
  return (
    <ConfigProvider theme={theme}>
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
          >
            <Dashboard />
          </main>
        </div>
      </div>
    </ConfigProvider>
  );
}
