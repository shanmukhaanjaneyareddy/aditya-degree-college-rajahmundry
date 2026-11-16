import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CollegeDataProvider } from './context/CollegeDataContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AnnouncementPopup from './components/AnnouncementPopup';
import Home from './pages/Home';
import Management from './pages/Management';
import AcademicYear from './pages/AcademicYear';
import Activities from './pages/Activities';
import ProjectExpos from './pages/ProjectExpos';
import Placements from './pages/Placements';
import AdminPortal from './pages/admin/AdminPortal';

// Secret Admin URL slug from .env (no link shown anywhere on the public site)
const ADMIN_ROUTE_SLUG =
  import.meta.env.VITE_ADMIN_ROUTE_SLUG || 'aditya-admin-portal-2026';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <AnnouncementPopup />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CollegeDataProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public College Portal Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/management" element={<Management />} />
              <Route path="/academic-year" element={<AcademicYear />} />
              <Route path="/activities" element={<Activities />} />
              <Route path="/project-expos" element={<ProjectExpos />} />
              <Route path="/placements" element={<Placements />} />
            </Route>

            {/* Hidden Admin Control Route (No public login button on site) */}
            <Route path={`/${ADMIN_ROUTE_SLUG}`} element={<AdminPortal />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CollegeDataProvider>
    </AuthProvider>
  );
}