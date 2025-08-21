
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import ReceptionistDashboard from '@/components/dashboards/ReceptionistDashboard';
import PhotographerDashboard from '@/components/dashboards/PhotographerDashboard';
import DesignerDashboard from '@/components/dashboards/DesignerDashboard';
import EditorDashboard from '@/components/dashboards/EditorDashboard';
import ClientDashboard from '@/components/dashboards/ClientDashboard';
import AdsManagerDashboard from '@/components/dashboards/AdsManagerDashboard';

const Dashboard = () => {
  const { userProfile } = useAuth();

  const renderDashboard = () => {
    if (!userProfile) return null;

    switch (userProfile.role) {
      case 'admin':
        return <AdminDashboard />;
                    case 'receptionist':
                      return <ReceptionistDashboard />;
                    case 'manager':
                      return <ReceptionistDashboard />;
      case 'photographer':
        return <PhotographerDashboard />;
      case 'designer':
        return <DesignerDashboard />;
      case 'editor':
        return <EditorDashboard />;
      case 'ads_manager':
        return <AdsManagerDashboard />;
      case 'client':
        return <ClientDashboard />;
      default:
        return <div>Unknown role</div>;
    }
  };

  return (
    <DashboardLayout>
      {renderDashboard()}
    </DashboardLayout>
  );
};

export default Dashboard;
