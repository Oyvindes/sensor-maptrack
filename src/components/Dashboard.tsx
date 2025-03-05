
import React from "react";
import { PageContainer, ContentContainer } from "./Layout";
import { useDashboardData } from "@/hooks/useDashboardData";
import DashboardHeader from "./dashboard/DashboardHeader";
import ProjectsSection from "./dashboard/ProjectsSection";
import SensorFolderEditor from "./admin/SensorFolderEditor";
import { getMockCompanies } from "@/services/company/companyService";

const Dashboard: React.FC = () => {
  const {
    projects,
    isLoading,
    selectedProject,
    editingProject,
    handleProjectSelect,
    handleProjectSave,
    handleProjectCancel,
    handleAddNewProject,
    handleRefresh
  } = useDashboardData();

  // Get companies for the folder editor
  const companies = getMockCompanies();

  return (
    <PageContainer>
      <DashboardHeader onRefresh={handleRefresh} onAddNewProject={handleAddNewProject} />

      <ContentContainer>
        {editingProject && selectedProject ? (
          <SensorFolderEditor
            folder={selectedProject}
            companies={companies}
            onSave={handleProjectSave}
            onCancel={handleProjectCancel}
          />
        ) : (
          <ProjectsSection 
            projects={projects} 
            isLoading={isLoading}
            onProjectSelect={handleProjectSelect} 
          />
        )}
      </ContentContainer>
    </PageContainer>
  );
};

export default Dashboard;
