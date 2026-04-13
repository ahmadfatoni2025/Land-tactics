import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { ScannerPage } from './pages/ScannerPage';
import { MapPage } from './pages/MapPage';
import { AssetsPage } from './pages/AssetsPage';
import { ReportsPage } from './pages/ReportsPage';
import { GenerateQRPage } from './pages/GenerateQRPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/scanner" element={<ScannerPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/assets" element={<AssetsPage />} />
          <Route path="/generate" element={<GenerateQRPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}