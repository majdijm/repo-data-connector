
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Dashboard from './pages/Dashboard';
import JobsPage from './pages/JobsPage';
import ClientsPage from './pages/ClientsPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import FilesPage from './pages/FilesPage';
import PaymentsPage from './pages/PaymentsPage';
import ContractsPage from './pages/ContractsPage';
import FinancialPage from './pages/FinancialPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/jobs" element={
            <ProtectedRoute requiredRoles={['admin', 'receptionist', 'photographer', 'designer', 'editor']}>
              <JobsPage />
            </ProtectedRoute>
          } />
          <Route path="/clients" element={
            <ProtectedRoute requiredRoles={['admin', 'receptionist']}>
              <ClientsPage />
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute requiredRoles={['admin']}>
              <UsersPage />
            </ProtectedRoute>
          } />
          <Route path="/files" element={
            <ProtectedRoute requiredRoles={['admin', 'receptionist', 'photographer', 'designer', 'editor']}>
              <FilesPage />
            </ProtectedRoute>
          } />
          <Route path="/payments" element={
            <ProtectedRoute requiredRoles={['admin', 'receptionist']}>
              <PaymentsPage />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />
          <Route path="/contracts" element={
            <ProtectedRoute requiredRoles={['admin', 'receptionist']}>
              <ContractsPage />
            </ProtectedRoute>
          } />
          <Route path="/financial" element={
            <ProtectedRoute requiredRoles={['admin', 'receptionist']}>
              <FinancialPage />
            </ProtectedRoute>
          } />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
