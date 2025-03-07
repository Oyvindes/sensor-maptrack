
import React from "react";
import { SectionContainer, SectionTitle } from "@/components/Layout";
import { SensorFolder } from "@/types/users";
import ProjectsMap from "./ProjectsMap";
import ProjectsList from "./ProjectsList";

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
  return (
    <SectionContainer>
      <SectionTitle>Projects Map</SectionTitle>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ProjectsMap 
            projects={projects} 
            isLoading={isLoading}
            onProjectSelect={onProjectSelect}
            className="w-full h-[400px] animate-fade-up [animation-delay:300ms]"
          />
        </div>
        <div>
          <ProjectsList
            projects={projects}
            isLoading={isLoading}
            onProjectSelect={onProjectSelect}
            onProjectStatusChange={onProjectStatusChange}
            className="h-[400px] overflow-auto animate-fade-up [animation-delay:400ms]"
          />
        </div>
      </div>
    </SectionContainer>
  );
};

export default ProjectsSection;
