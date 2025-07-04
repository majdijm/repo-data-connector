
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import ReceptionistDashboard from '@/components/dashboards/ReceptionistDashboard';
import PhotographerDashboard from '@/components/dashboards/PhotographerDashboard';
import DesignerDashboard from '@/components/dashboards/DesignerDashboard';
import EditorDashboard from '@/components/dashboards/EditorDashboard';
import ClientDashboard from '@/components/dashboards/ClientDashboard';

const Dashboard = () => {
  const { userProfile } = useAuth();

  const renderDashboard = () => {
    if (!userProfile) {
      return <div>Loading...</div>;
    }

    switch (userProfile.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'receptionist':
        return <ReceptionistDashboard />;
      case 'photographer':
        return <PhotographerDashboard userProfile={userProfile} />;
      case 'designer':
        return <DesignerDashboard userProfile={userProfile} />;
      case 'editor':
        return <EditorDashboard userProfile={userProfile} />;
      case 'client':
        return <ClientDashboard userProfile={userProfile} />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <DashboardLayout>
      {renderDashboard()}
    </DashboardLayout>
  );
};

export default Dashboard;
