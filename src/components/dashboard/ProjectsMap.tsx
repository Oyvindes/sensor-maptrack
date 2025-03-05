
import React from "react";
import { SensorFolder } from "@/types/users";
import { MapPin } from "lucide-react";
import TrackingMap from "@/components/TrackingMap";
import { cn } from "@/lib/utils";

interface ProjectsMapProps {
  projects: SensorFolder[];
  isLoading: boolean;
  onProjectSelect: (project: SensorFolder) => void;
  className?: string;
}

const ProjectsMap: React.FC<ProjectsMapProps> = ({ 
  projects, 
  isLoading,
  onProjectSelect,
  className 
}) => {
  // Filter projects that have location data
  const projectsWithLocation = projects.filter(project => project.location);
  
  // Convert projects to devices for TrackingMap
  const devices = projectsWithLocation.map(project => ({
    id: project.id,
    name: project.name,
    type: "project",
    status: "online" as const, // Fix: Explicitly specify as "online" | "offline" | "maintenance"
    location: project.location,
    companyId: project.companyId
  }));

  if (isLoading) {
    return (
      <div className={cn("glass-card rounded-xl animate-pulse-soft", className)}>
        <div className="h-full flex items-center justify-center">
          <p className="text-muted-foreground">Loading projects map...</p>
        </div>
      </div>
    );
  }

  if (projectsWithLocation.length === 0) {
    return (
      <div className={cn("glass-card rounded-xl p-4", className)}>
        <div className="h-full flex flex-col items-center justify-center space-y-2">
          <MapPin className="h-12 w-12 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No projects with location data found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl overflow-hidden", className)}>
      <TrackingMap 
        devices={devices}
        className="h-full w-full"
        onDeviceClick={(deviceId) => {
          const project = projects.find(p => p.id === deviceId);
          if (project) {
            onProjectSelect(project);
          }
        }}
      />
    </div>
  );
};

export default ProjectsMap;
