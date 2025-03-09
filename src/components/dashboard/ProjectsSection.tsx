
import React from "react";
import { SectionContainer, SectionTitle } from "@/components/Layout";
import { SensorFolder } from "@/types/users";
import ProjectsMap from "./ProjectsMap";
import ProjectsList from "./ProjectsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProjectsSectionProps {
  projects: SensorFolder[];
  isLoading: boolean;
  onProjectSelect: (project: SensorFolder) => void;
  onProjectStatusChange?: (projectId: string, status: "running" | "stopped") => void;
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projects,
  isLoading,
  onProjectSelect,
  onProjectStatusChange
}) => {
  // Filter projects for different views
  const runningProjects = projects.filter(p => p.status === "running");
  const stoppedProjects = projects.filter(p => p.status === "stopped");
  
  return (
    <SectionContainer>
      <SectionTitle>Projects Overview</SectionTitle>
      
      <Tabs defaultValue="map" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="map">Map View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="map" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 glass-card rounded-xl overflow-hidden">
              <ProjectsMap
                projects={runningProjects}
                isLoading={isLoading}
                onProjectSelect={onProjectSelect}
                className="w-full h-[400px] animate-fade-up [animation-delay:300ms]"
              />
            </div>
            <div className="flex flex-col glass-card rounded-xl h-[433px]">
              <h3 className="text-base font-semibold p-3 border-b border-border animate-fade-up [animation-delay:350ms]">
                Running Projects
              </h3>
              <div className="flex-1 overflow-hidden">
                <ProjectsList
                  projects={runningProjects}
                  isLoading={isLoading}
                  onProjectSelect={onProjectSelect}
                  onProjectStatusChange={onProjectStatusChange}
                  className="h-full overflow-auto animate-fade-up [animation-delay:400ms]"
                />
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="list" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex flex-col glass-card rounded-xl h-[400px]">
              <h3 className="text-base font-semibold p-3 border-b border-border animate-fade-up [animation-delay:350ms]">
                Running Projects
              </h3>
              <div className="flex-1 overflow-hidden">
                <ProjectsList
                  projects={runningProjects}
                  isLoading={isLoading}
                  onProjectSelect={onProjectSelect}
                  onProjectStatusChange={onProjectStatusChange}
                  className="h-full overflow-auto animate-fade-up [animation-delay:400ms]"
                />
              </div>
            </div>
            
            <div className="flex flex-col glass-card rounded-xl h-[400px]">
              <h3 className="text-base font-semibold p-3 border-b border-border animate-fade-up [animation-delay:350ms]">
                Stopped Projects
              </h3>
              <div className="flex-1 overflow-hidden">
                <ProjectsList
                  projects={stoppedProjects}
                  isLoading={isLoading}
                  onProjectSelect={onProjectSelect}
                  onProjectStatusChange={onProjectStatusChange}
                  className="h-full overflow-auto animate-fade-up [animation-delay:400ms]"
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </SectionContainer>
  );
};

export default ProjectsSection;
