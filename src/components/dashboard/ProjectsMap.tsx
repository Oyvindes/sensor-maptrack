import React from "react";
import { SensorFolder } from "@/types/users";
import { MapPin } from "lucide-react";
import TrackingMap from "@/components/TrackingMap";
import { cn } from "@/lib/utils";
import { Location } from "@/types/sensors";

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
  // Parse location data and filter projects that have valid location data
  const projectsWithLocation = projects.filter(project => {
    if (!project.location) return false;
    
    // If it's already the correct shape, keep it
    if (typeof project.location === 'object' && 'lat' in project.location && 'lng' in project.location) {
      return true;
    }
    
    // If it's a string, try to parse it
    if (typeof project.location === 'string') {
      try {
        JSON.parse(project.location);
        return true;
      } catch (e) {
        console.error(`Failed to parse location for project ${project.id}:`, e);
        return false;
      }
    }
    
    return false;
  });
  
  // Convert projects to devices for TrackingMap with proper location typing
  const devices = projectsWithLocation.map(project => {
    // Parse the location if it's a string
    let locationData: Location;
    
    if (typeof project.location === 'string') {
      try {
        locationData = JSON.parse(project.location);
      } catch (e) {
        // Fallback to Trondheim center if parsing fails
        console.error(`Using fallback location for project ${project.id}`);
        locationData = { lat: 63.4305, lng: 10.3951 }; // Trondheim center
      }
    } else {
      locationData = project.location as Location;
    }
    
    return {
      id: project.id,
      name: project.name,
      type: "project",
      status: "online" as const,
      location: locationData,
      companyId: project.companyId
    };
  });

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
