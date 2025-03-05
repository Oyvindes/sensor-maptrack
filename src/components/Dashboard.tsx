
import React, { useState } from "react";
import { PageContainer, ContentContainer } from "./Layout";
import { useDashboardData } from "@/hooks/useDashboardData";
import DashboardHeader from "./dashboard/DashboardHeader";
import ProjectsSection from "./dashboard/ProjectsSection";
import SensorFolderEditor from "./admin/SensorFolderEditor";
import { getMockCompanies } from "@/services/company/companyService";
import DashboardSidebar from "./dashboard/DashboardSidebar";

const Dashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'projects'>('dashboard');
  
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

  const renderContent = () => {
    if (editingProject && selectedProject) {
      return (
        <SensorFolderEditor
          folder={selectedProject}
          companies={companies}
          onSave={handleProjectSave}
          onCancel={handleProjectCancel}
        />
      );
    }

    if (activeView === 'projects') {
      return (
        <ProjectsSection 
          projects={projects} 
          isLoading={isLoading}
          onProjectSelect={handleProjectSelect} 
        />
      );
    }

    // Default dashboard view
    return (
      <>
        {/* The dashboard will eventually show more sections */}
        <ProjectsSection 
          projects={projects} 
          isLoading={isLoading}
          onProjectSelect={handleProjectSelect} 
        />
      </>
    );
  };

  return (
    <div className="flex h-screen">
      <DashboardSidebar 
        activeView={activeView} 
        onViewChange={setActiveView} 
      />
      <div className="flex-1 overflow-auto">
        <PageContainer>
          <DashboardHeader 
            onRefresh={handleRefresh} 
            onAddNewProject={handleAddNewProject} 
          />

          <ContentContainer>
            {renderContent()}
          </ContentContainer>
        </PageContainer>
      </div>
    </div>
  );
};

export default Dashboard;
