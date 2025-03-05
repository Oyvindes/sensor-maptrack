
import React, { useState } from "react";
import { PageContainer, ContentContainer } from "./Layout";
import { useDashboardData } from "@/hooks/useDashboardData";
import DashboardHeader from "./dashboard/DashboardHeader";
import ProjectsSection from "./dashboard/ProjectsSection";
import SensorFolderEditor from "./admin/SensorFolderEditor";
import { getMockCompanies } from "@/services/company/companyService";
import DashboardNavigation from "./dashboard/DashboardNavigation";
import ProjectsList from "./dashboard/ProjectsList";

// View types for the dashboard
type DashboardView = "dashboard" | "projects";

const Dashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<DashboardView>("dashboard");
  
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

  // Toggle between views
  const handleViewChange = (view: DashboardView) => {
    setCurrentView(view);
  };

  return (
    <PageContainer>
      <DashboardHeader 
        onRefresh={handleRefresh} 
        onAddNewProject={currentView === "projects" ? handleAddNewProject : undefined} 
      />
      
      <DashboardNavigation 
        currentView={currentView} 
        onViewChange={handleViewChange} 
      />

      <ContentContainer>
        {editingProject && selectedProject ? (
          <SensorFolderEditor
            folder={selectedProject}
            companies={companies}
            onSave={handleProjectSave}
            onCancel={handleProjectCancel}
          />
        ) : currentView === "dashboard" ? (
          <ProjectsSection 
            projects={projects} 
            isLoading={isLoading}
            onProjectSelect={handleProjectSelect} 
          />
        ) : (
          <div className="w-full animate-fade-up [animation-delay:300ms]">
            <h2 className="text-xl font-semibold mb-4">Projects</h2>
            <ProjectsList 
              projects={projects} 
              isLoading={isLoading}
              onProjectSelect={handleProjectSelect}
              className="h-auto w-full" 
            />
          </div>
        )}
      </ContentContainer>
    </PageContainer>
  );
};

export default Dashboard;
