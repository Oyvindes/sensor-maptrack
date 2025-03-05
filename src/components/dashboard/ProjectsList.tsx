
import React from "react";
import { SensorFolder } from "@/types/users";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectsListProps {
  projects: SensorFolder[];
  isLoading: boolean;
  onProjectSelect: (project: SensorFolder) => void;
  className?: string;
}

const ProjectsList: React.FC<ProjectsListProps> = ({ 
  projects, 
  isLoading,
  onProjectSelect,
  className 
}) => {
  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        {[1, 2, 3].map((_, index) => (
          <Card key={index} className="animate-pulse-soft">
            <CardContent className="p-3">
              <div className="h-5 bg-secondary rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-secondary rounded-full w-full opacity-50"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className={cn("glass-card rounded-xl p-4", className)}>
        <div className="h-full flex flex-col items-center justify-center space-y-2">
          <p className="text-muted-foreground">No projects found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {projects.map((project) => (
        <Card 
          key={project.id} 
          className="hover:bg-accent/50 transition-colors cursor-pointer"
          onClick={() => onProjectSelect(project)}
        >
          <CardContent className="p-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-sm">{project.name}</h3>
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {project.address || project.description || project.projectNumber}
                </p>
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                {project.location && <MapPin className="h-3 w-3" />}
                <span className="flex items-center gap-1">
                  <Cpu className="h-3 w-3" />
                  {project.assignedSensorIds?.length || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProjectsList;
