import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import PortalLayout from './components/portal/PortalLayout';
import LoginPage from './pages/LoginPage';
import PortalHomePage from './pages/PortalHomePage';
import NotFoundPage from './pages/NotFoundPage';
import { LoadingSpinner } from './components/common/LoadingSpinner';

const CWVAuditModule = lazy(() => import('./modules/cwv-audit'));

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <PortalLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<PortalHomePage />} />
            <Route
              path="/cwv-audit/*"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <CWVAuditModule />
                </Suspense>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
