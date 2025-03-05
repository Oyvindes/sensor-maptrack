
import React from "react";
import { PageContainer, ContentContainer } from "./Layout";
import { useDashboardData } from "@/hooks/useDashboardData";
import DashboardHeader from "./dashboard/DashboardHeader";
import ProjectsSection from "./dashboard/ProjectsSection";
import SensorSection from "./dashboard/SensorSection";

const Dashboard: React.FC = () => {
  const {
    sensors,
    projects,
    isLoading,
    handleSensorClick,
    handleProjectSelect,
    handleRefresh
  } = useDashboardData();

  return (
    <PageContainer>
      <DashboardHeader onRefresh={handleRefresh} />

      <ContentContainer>
        <ProjectsSection 
          projects={projects} 
          isLoading={isLoading}
          onProjectSelect={handleProjectSelect} 
        />
        
        <SensorSection 
          sensors={sensors} 
          isLoading={isLoading} 
          onSensorClick={handleSensorClick} 
        />
      </ContentContainer>
    </PageContainer>
  );
};

export default Dashboard;
