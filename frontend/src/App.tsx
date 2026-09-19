import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { GISMapPage } from './pages/GISMapPage';
import { CycloneDetailPage } from './pages/CycloneDetailPage';
import { HistoricalExplorerPage } from './pages/HistoricalExplorerPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AlertCenterPage } from './pages/AlertCenterPage';
import { AdminPanelPage } from './pages/AdminPanelPage';
import { DocumentationPage } from './pages/DocumentationPage';
import { AILabPage } from './pages/AILabPage';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col selection:bg-cyan-500 selection:text-white">
      <Navbar activeStormName="Cyclone Dana" alertLevel="Red" />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Landing Page without dashboard chrome */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Operational Views inside AppLayout */}
        <Route
          path="/dashboard"
          element={
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          }
        />
        <Route
          path="/map"
          element={
            <AppLayout>
              <GISMapPage />
            </AppLayout>
          }
        />
        <Route
          path="/cyclones/:id"
          element={
            <AppLayout>
              <CycloneDetailPage />
            </AppLayout>
          }
        />
        <Route
          path="/ai-lab"
          element={
            <AppLayout>
              <AILabPage />
            </AppLayout>
          }
        />
        <Route
          path="/history"
          element={
            <AppLayout>
              <HistoricalExplorerPage />
            </AppLayout>
          }
        />
        <Route
          path="/analytics"
          element={
            <AppLayout>
              <AnalyticsPage />
            </AppLayout>
          }
        />
        <Route
          path="/alerts"
          element={
            <AppLayout>
              <AlertCenterPage />
            </AppLayout>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AdminPanelPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/docs"
          element={
            <AppLayout>
              <DocumentationPage />
            </AppLayout>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
