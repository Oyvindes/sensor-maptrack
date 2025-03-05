
import React from "react";
import { PageContainer, ContentContainer } from "./Layout";
import { useDashboardData } from "@/hooks/useDashboardData";
import DashboardHeader from "./dashboard/DashboardHeader";
import ProjectsSection from "./dashboard/ProjectsSection";

const Dashboard: React.FC = () => {
  const {
    projects,
    isLoading,
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
      </ContentContainer>
    </PageContainer>
  );
};

export default Dashboard;
