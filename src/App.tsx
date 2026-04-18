import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { ScannerPage } from './pages/ScannerPage';
import { MapPage } from './pages/MapPage';
import { AssetsPage } from './pages/AssetsPage';
import { ReportsPage } from './pages/ReportsPage';
import { GenerateQRPage } from './pages/GenerateQRPage';
import { Login } from './pages/login/Login';
import { Signup } from './pages/signup/Signup';
import { Home } from './pages/Home';
import Userdashboard from './pages/signup/Userdashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/scanner" element={<ScannerPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/assets" element={<AssetsPage />} />
          <Route path="/generate" element={<GenerateQRPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/user-dashboard" element={<Userdashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}