
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import DirectionProvider from '@/components/DirectionProvider';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/ProtectedRoute';
import Index from '@/pages/Index';
import LoginPage from '@/pages/LoginPage';
import Dashboard from '@/pages/Dashboard';
import Users from '@/pages/Users';
import Clients from '@/pages/Clients';
import JobsPage from '@/pages/JobsPage';
import Tasks from '@/pages/Tasks';
import Calendar from '@/pages/Calendar';
import Settings from '@/pages/Settings';
import FinancialPage from '@/pages/FinancialPage';
import PaymentsPage from '@/pages/PaymentsPage';
import JobDetails from '@/pages/JobDetails';
import FilesPage from '@/pages/FilesPage';
import ProjectsPage from '@/pages/ProjectsPage';
import AttendancePage from '@/pages/AttendancePage';
import NotificationsPage from '@/pages/NotificationsPage';
import ClientPortalPage from '@/pages/ClientPortalPage';
import PackagesPage from '@/pages/PackagesPage';

// Create QueryClient outside component to prevent recreation on each render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LanguageProvider>
            <DirectionProvider>
              <Router>
                <div className="App">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/users" element={
                      <ProtectedRoute>
                        <Users />
                      </ProtectedRoute>
                    } />
                    <Route path="/clients" element={
                      <ProtectedRoute>
                        <Clients />
                      </ProtectedRoute>
                    } />
                    <Route path="/jobs" element={
                      <ProtectedRoute>
                        <JobsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/jobs/:id" element={
                      <ProtectedRoute>
                        <JobDetails />
                      </ProtectedRoute>
                    } />
                    <Route path="/tasks" element={
                      <ProtectedRoute>
                        <Tasks />
                      </ProtectedRoute>
                    } />
                    <Route path="/calendar" element={
                      <ProtectedRoute>
                        <Calendar />
                      </ProtectedRoute>
                    } />
                    <Route path="/settings" element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    } />
                    <Route path="/financial" element={
                      <ProtectedRoute>
                        <FinancialPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/payments" element={
                      <ProtectedRoute>
                        <PaymentsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/files" element={
                      <ProtectedRoute>
                        <FilesPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/projects" element={
                      <ProtectedRoute>
                        <ProjectsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/attendance" element={
                      <ProtectedRoute>
                        <AttendancePage />
                      </ProtectedRoute>
                    } />
                    <Route path="/notifications" element={
                      <ProtectedRoute>
                        <NotificationsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/client-portal" element={
                      <ProtectedRoute>
                        <ClientPortalPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/packages" element={
                      <ProtectedRoute>
                        <PackagesPage />
                      </ProtectedRoute>
                    } />
                  </Routes>
                  <Toaster />
                </div>
              </Router>
            </DirectionProvider>
          </LanguageProvider>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
