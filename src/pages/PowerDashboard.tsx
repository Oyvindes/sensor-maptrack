import React from 'react';
import { PageContainer, ContentContainer } from '@/components/Layout';
import PowerSensorDashboard from '@/components/power/PowerSensorDashboard';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardNavigation from '@/components/dashboard/DashboardNavigation';
import { useNavigate } from 'react-router-dom';

const PowerDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  const handleViewChange = (view: "dashboard" | "projects" | "tracking" | "help" | "store") => {
    switch(view) {
      case "dashboard":
        navigate("/overview");
        break;
      case "projects":
        navigate("/projects");
        break;
      case "tracking":
        navigate("/track");
        break;
      case "help":
        navigate("/support");
        break;
      case "store":
        navigate("/shop");
        break;
    }
  };
  
  return (
    <PageContainer>
      <DashboardHeader onViewChange={handleViewChange} />
      <DashboardNavigation currentView="dashboard" onViewChange={handleViewChange} />
      <ContentContainer>
        <PowerSensorDashboard />
      </ContentContainer>
    </PageContainer>
  );
};

export default PowerDashboard;