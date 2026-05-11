import type { ReactElement } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './routes/ProtectedRoute';
import AppLayout from './layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import HospitalsPage from './pages/HospitalsPage';
import PatientsPage from './pages/PatientsPage';
import DoctorsPage from './pages/DoctorsPage';
import { useAuth } from './auth/AuthProvider';

function RequireSuperAdmin({ children }: { children: ReactElement }) {
  const { user } = useAuth();
  if (user?.role !== 'superAdmin') return <Navigate to="/" replace />;
  return children;
}

function RequireHospitalAdmin({ children }: { children: ReactElement }) {
  const { user } = useAuth();
  if (user?.role !== 'hospitalAdmin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route
          path="hospitals"
          element={
            <RequireSuperAdmin>
              <HospitalsPage />
            </RequireSuperAdmin>
          }
        />
        <Route
          path="patients"
          element={
            <RequireHospitalAdmin>
              <PatientsPage />
            </RequireHospitalAdmin>
          }
        />
        <Route
          path="doctors"
          element={
            <RequireHospitalAdmin>
              <DoctorsPage />
            </RequireHospitalAdmin>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
