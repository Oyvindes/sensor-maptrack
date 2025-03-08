
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
      <SectionTitle>Running Projects Map</SectionTitle>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card rounded-xl overflow-hidden">
          <ProjectsMap
            projects={projects.filter(p => p.status === "running")}
            isLoading={isLoading}
            onProjectSelect={onProjectSelect}
            className="w-full h-[400px] animate-fade-up [animation-delay:300ms]"
          />
        </div>
        <div className="flex flex-col glass-card rounded-xl h-[433px]"> {/* Match the height of the map container + title */}
          <h3 className="text-base font-semibold p-3 border-b border-border animate-fade-up [animation-delay:350ms]">
            Started Projects
          </h3>
          <div className="flex-1 overflow-hidden">
            <ProjectsList
              projects={projects.filter(p => p.status === "running")}
              isLoading={isLoading}
              onProjectSelect={onProjectSelect}
              onProjectStatusChange={onProjectStatusChange}
              className="h-full overflow-auto animate-fade-up [animation-delay:400ms]"
            />
          </div>
        </div>
      </div>
    </SectionContainer>
  );
};

export default ProjectsSection;
