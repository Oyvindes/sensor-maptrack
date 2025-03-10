
import React, { useState, useEffect } from "react";
import { SensorFolder } from "@/types/users";
import { MapPin, ArrowRight } from "lucide-react";
import TrackingMap from "@/components/TrackingMap";
import { cn } from "@/lib/utils";
import { Location } from "@/types/sensors";
import { Button } from "@/components/ui/button";
import { getAddressCoordinates } from "@/services/geocodingService";

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
  // State to track geocoded projects
  const [geocodedProjects, setGeocodedProjects] = useState<SensorFolder[]>([]);
  const [isGeocodingComplete, setIsGeocodingComplete] = useState(false);

  // Process projects to add location data where needed
  useEffect(() => {
    const processProjects = async () => {
      const processed = [...projects];
      let needsGeocoding = false;

      // Process each project to ensure it has location data
      for (let i = 0; i < processed.length; i++) {
        const project = processed[i];
        
        // Skip if project already has valid location data
        if (project.location &&
           (typeof project.location === 'object' && 'lat' in project.location && 'lng' in project.location)) {
          continue;
        }
        
        // Try to parse string location
        if (project.location && typeof project.location === 'string') {
          try {
            const parsed = JSON.parse(project.location);
            if (parsed && 'lat' in parsed && 'lng' in parsed) {
              processed[i].location = parsed;
              console.log(`Parsed location for project ${project.id}:`, parsed);
              continue;
            }
          } catch (e) {
            console.warn(`Failed to parse location for project ${project.id}:`, e);
          }
        }
        
        // If we have an address but no location, get coordinates for it
        if (project.address && !project.location) {
          needsGeocoding = true;
          try {
            console.log(`Geocoding address for project ${project.id}: ${project.address}`);
            const coords = await getAddressCoordinates(project.address);
            console.log(`Received coordinates for project ${project.id}:`, coords);
            processed[i].location = coords;
          } catch (e) {
            console.error(`Geocoding failed for project ${project.id}:`, e);
          }
        }
      }
      
      setGeocodedProjects(processed);
      setIsGeocodingComplete(true);
    };
    
    processProjects();
  }, [projects]);
  
  // Wait for geocoding to complete before filtering projects
  const projectsWithLocation = isGeocodingComplete
    ? geocodedProjects.filter(project =>
        project.location &&
        (typeof project.location === 'object' && 'lat' in project.location && 'lng' in project.location)
      )
    : [];
  
  // Convert projects to devices for TrackingMap with proper location typing
  const devices = projectsWithLocation.map(project => {
    // Parse the location data with type safety
    let locationData: Location;
    
    if (typeof project.location === 'string') {
      try {
        locationData = JSON.parse(project.location);
        console.log(`Parsed string location for project ${project.id}:`, locationData);
      } catch (e) {
        console.error(`Using default location for project ${project.id}, parsing error:`, e);
        locationData = { lat: 61.497, lng: 8.468 }; // Central Norway coordinates
      }
    } else if (project.location && typeof project.location === 'object' && 'lat' in project.location && 'lng' in project.location) {
      // Already in the correct format
      locationData = project.location as Location;
      console.log(`Using object location for project ${project.id}:`, locationData);
    } else {
      console.error(`Invalid location format for project ${project.id}:`, project.location);
      locationData = { lat: 61.497, lng: 8.468 }; // Central Norway coordinates
    }
    
    return {
      id: project.id,
      name: project.name,
      type: "project",
      status: "online" as const,
      location: locationData,
      companyId: project.companyId,
      // Add additional properties for use in popup
      projectNumber: project.projectNumber,
      sensorCount: project.assignedSensorIds?.length || 0
    };
  });

  // Function to render custom popups
  const renderCustomPopup = (device: any) => {
    // Find the corresponding project
    const project = projects.find(p => p.id === device.id);
    
    if (!project) return null;
    
    return (
      <div className="flex flex-col gap-0.5 p-0.5">
        <h3 className="font-bold text-sm">{device.name}</h3>
        <div className="grid gap-0.5 text-xs">
          {device.projectNumber && <p>Project #: {device.projectNumber}</p>}
          <p>Sensors: {device.sensorCount}</p>
        </div>
        <Button 
          size="sm" 
          className="mt-0.5 w-full h-6 text-xs px-1 py-0"
          onClick={(e) => {
            e.stopPropagation(); // Prevent event bubbling
            if (project) {
              console.log("Project select button clicked:", project.id);
              onProjectSelect(project);
            }
          }}
        >
          More <ArrowRight className="ml-1 w-3 h-3" />
        </Button>
      </div>
    );
  };

  if (isLoading || !isGeocodingComplete) {
    return (
      <div className={cn("animate-pulse-soft", className)}>
        <div className="h-full flex items-center justify-center">
          <p className="text-muted-foreground">
            {!isGeocodingComplete ? "Geocoding addresses..." : "Loading projects map..."}
          </p>
        </div>
      </div>
    );
  }

  if (projectsWithLocation.length === 0) {
    return (
      <div className={cn("p-4", className)}>
        <div className="h-full flex flex-col items-center justify-center space-y-2">
          <MapPin className="h-12 w-12 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No running projects found</p>
          <p className="text-xs text-muted-foreground">Start a project to see it on the map</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl overflow-hidden", className)}>
      <TrackingMap
        devices={devices}
        className="h-full w-full"
        fitAllMarkers={true} // Initial fit to all markers
        autoFitMarkers={false} // Don't automatically fit to markers when zooming
        onDeviceClick={(deviceId) => {
          console.log("Device clicked:", deviceId);
          const project = projects.find(p => p.id === deviceId);
          if (project) {
            onProjectSelect(project);
          }
        }}
        renderCustomPopup={renderCustomPopup}
      />
    </div>
  );
};

export default ProjectsMap;
