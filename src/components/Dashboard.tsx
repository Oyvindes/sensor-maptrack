
import React from "react";
import { PageContainer, ContentContainer } from "./Layout";
import { useDashboardData } from "@/hooks/useDashboardData";
import DashboardHeader from "./dashboard/DashboardHeader";
import ProjectsSection from "./dashboard/ProjectsSection";
import SensorFolderEditor from "./admin/SensorFolderEditor";
import { getMockCompanies } from "@/services/company/companyService";
import DashboardSidebar from "./dashboard/DashboardSidebar";

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
    <div className="flex h-screen">
      <DashboardSidebar />
      <div className="flex-1 overflow-auto">
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
      </div>
    </div>
  );
};

export default Dashboard;
