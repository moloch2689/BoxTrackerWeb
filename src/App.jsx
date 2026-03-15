import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { setHouseholdCode, setBoxesFromCloud } from './store';
import { subscribeToBoxes } from './firestore';
import { colors } from './theme';

import DashboardScreen from './screens/DashboardScreen';
import BoxesScreen     from './screens/BoxesScreen';
import BoxDetailScreen from './screens/BoxDetailScreen';
import ItemsScreen     from './screens/ItemsScreen';
import SearchScreen    from './screens/SearchScreen';
import ScanScreen      from './screens/ScanScreen';
import SettingsScreen  from './screens/SettingsScreen';

const STORAGE_KEY = 'boxtracker_household';
let _unsubscribe = null;

const tabs = [
  { path: '/',        label: 'Dashboard' },
  { path: '/boxes',   label: 'Boxes' },
  { path: '/items',   label: 'Items' },
  { path: '/search',  label: 'Search' },
  { path: '/scan',    label: 'Scan QR' },
  { path: '/settings',label: 'Settings' },
];

function TabBar() {
  const { pathname } = useLocation();
  return (
    <div style={{
      background: colors.surface, borderBottom: `1px solid ${colors.border}`,
      overflowX: 'auto', display: 'flex', flexShrink: 0,
    }}>
      {tabs.map(({ path, label }) => {
        const active = path === '/' ? pathname === '/' : pathname.startsWith(path);
        return (
          <NavLink key={path} to={path} style={{
            padding: '14px 18px', whiteSpace: 'nowrap', fontSize: 13, fontWeight: 700,
            fontFamily: 'monospace', color: active ? colors.accent2 : colors.text3,
            borderBottom: `2px solid ${active ? colors.accent2 : 'transparent'}`,
            textDecoration: 'none',
          }}>
            {label}
          </NavLink>
        );
      })}
    </div>
  );
}

function Layout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      {/* Header */}
      <div style={{ background: colors.surface, borderBottom: `1px solid ${colors.border}`,
        padding: '14px 20px', flexShrink: 0 }}>
        <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: colors.accent2 }}>
          // BOXTRACKER
        </span>
      </div>

      {/* Tab bar */}
      <TabBar />

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Routes>
          <Route path="/"          element={<DashboardScreen />} />
          <Route path="/boxes"     element={<BoxesScreen />} />
          <Route path="/box/:boxId"element={<BoxDetailScreen />} />
          <Route path="/items"     element={<ItemsScreen />} />
          <Route path="/search"    element={<SearchScreen />} />
          <Route path="/scan"      element={<ScanScreen />} />
          <Route path="/settings"  element={<SettingsScreen />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    const code = localStorage.getItem(STORAGE_KEY);
    if (code) {
      setHouseholdCode(code);
      _unsubscribe = subscribeToBoxes(code, setBoxesFromCloud);
    }
    return () => { if (_unsubscribe) _unsubscribe(); };
  }, []);

  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
