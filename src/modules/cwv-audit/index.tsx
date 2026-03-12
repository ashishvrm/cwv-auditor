import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CWVLayout from './components/CWVLayout';
import CWVDashboardPage from './pages/CWVDashboardPage';
import CWVPagesListPage from './pages/CWVPagesListPage';
import CWVPageDetailPage from './pages/CWVPageDetailPage';
import CWVTrendsPage from './pages/CWVTrendsPage';
import CWVSettingsPage from './pages/CWVSettingsPage';

const CWVAuditModule: React.FC = () => (
  <CWVLayout>
    <Routes>
      <Route index element={<CWVDashboardPage />} />
      <Route path="pages" element={<CWVPagesListPage />} />
      <Route path="pages/:pageId" element={<CWVPageDetailPage />} />
      <Route path="trends" element={<CWVTrendsPage />} />
      <Route path="settings" element={<CWVSettingsPage />} />
    </Routes>
  </CWVLayout>
);

export default CWVAuditModule;
