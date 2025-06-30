
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from './dashboards/AdminDashboard';
import ReceptionistDashboard from './dashboards/ReceptionistDashboard';
import PhotographerDashboard from './dashboards/PhotographerDashboard';
import DesignerDashboard from './dashboards/DesignerDashboard';
import EditorDashboard from './dashboards/EditorDashboard';
import ClientDashboard from './dashboards/ClientDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return null;

  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'receptionist':
        return <ReceptionistDashboard />;
      case 'photographer':
        return <PhotographerDashboard />;
      case 'designer':
        return <DesignerDashboard />;
      case 'editor':
        return <EditorDashboard />;
      case 'client':
        return <ClientDashboard />;
      default:
        return <div>Dashboard not found for this role</div>;
    }
  };

  return renderDashboard();
};

export default Dashboard;
