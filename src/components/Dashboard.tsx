import React, { useState, useEffect } from "react";
import SensorDataGraphs from "./dashboard/SensorDataGraphs";
import { PageContainer, ContentContainer } from "./Layout";
import { useDashboardData } from "@/hooks/useDashboardData";
import DashboardHeader from "./dashboard/DashboardHeader";
import ProjectsSection from "./dashboard/ProjectsSection";
import SensorFolderEditor from "./admin/SensorFolderEditor";
import { companyService } from "@/services/company";
import { Company } from "@/types/users";
import DashboardNavigation from "./dashboard/DashboardNavigation";
import ProjectsList from "./dashboard/ProjectsList";
import TrackingSection from "./dashboard/TrackingSection";
import { toast } from "sonner";

// View types for the dashboard
type DashboardView = "dashboard" | "projects" | "tracking";

const Dashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<DashboardView>("dashboard");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  
  const {
    projects,
    isLoading,
    selectedProject,
    editingProject,
    handleProjectSelect,
    handleProjectSave,
    handleProjectCancel,
    handleAddNewProject,
    handleRefresh,
    handleProjectStatusChange,
    handleProjectDelete,
    viewingSensorData,
    handleCloseGraphs
  } = useDashboardData();

  // Fetch companies for the folder editor
  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoadingCompanies(true);
      try {
        const companiesData = await companyService.list();
        setCompanies(companiesData);
      } catch (error) {
        console.error('Error fetching companies:', error);
        toast.error('Failed to load companies');
      } finally {
        setIsLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);

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
        {viewingSensorData && selectedProject ? (
          <SensorDataGraphs
            project={selectedProject}
            onClose={handleCloseGraphs}
          />
        ) : editingProject && selectedProject ? (
          // Show loading state while companies are being fetched
          isLoadingCompanies ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <SensorFolderEditor
              folder={selectedProject}
              companies={companies}
              onSave={handleProjectSave}
              onCancel={handleProjectCancel}
            />
          )
        ) : currentView === "dashboard" ? (
          <ProjectsSection
            projects={projects}
            isLoading={isLoading}
            onProjectSelect={handleProjectSelect}
            onProjectStatusChange={handleProjectStatusChange}
            onProjectDelete={handleProjectDelete}
          />
        ) : currentView === "tracking" ? (
          <TrackingSection className="w-full animate-fade-up [animation-delay:300ms]" />
        ) : (
          <div className="w-full animate-fade-up [animation-delay:300ms]">
            <h2 className="text-xl font-semibold mb-4">Projects</h2>
            <ProjectsList
              projects={projects}
              isLoading={isLoading}
              onProjectSelect={handleProjectSelect}
              onProjectStatusChange={handleProjectStatusChange}
              onProjectDelete={handleProjectDelete}
              className="h-auto w-full"
            />
          </div>
        )}
      </ContentContainer>
    </PageContainer>
  );
};

export default Dashboard;
