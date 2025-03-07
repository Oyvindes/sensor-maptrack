
import React, { useState } from "react";
import { SensorFolder } from "@/types/users";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Cpu, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { scanSensorQrCode } from "@/utils/cameraUtils";
import { toast } from "sonner";

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
  const [loadingProjectId, setLoadingProjectId] = useState<string | null>(null);

  const handleCameraClick = async (e: React.MouseEvent, project: SensorFolder) => {
    e.stopPropagation(); // Prevent card click event
    
    try {
      setLoadingProjectId(project.id);
      
      const scanResult = await scanSensorQrCode();
      
      if (scanResult.success && scanResult.data) {
        // Format the scanned IMEI as a sensor ID
        const sensorImei = scanResult.data.replace(/[^0-9]/g, '');
        const sensorId = `sensor-${sensorImei}`;
        
        // Check if sensor already assigned to this project
        if (project.assignedSensorIds?.includes(sensorId)) {
          toast.info("This sensor is already assigned to this project");
        } else {
          // Here we would typically update the project with the new sensor
          // via an API call. For now, we'll just log it.
          console.log(`Sensor ${sensorId} scanned for project ${project.id}`);
          
          // Create a copy of the project with the new sensor added
          const updatedProject = { 
            ...project,
            assignedSensorIds: [...(project.assignedSensorIds || []), sensorId]
          };
          
          // Simulate updating the project
          // In a real application, this would be part of an API call
          // or dispatched to a state management system
          setTimeout(() => {
            toast.success(`Sensor ${sensorImei} added to ${project.name}`);
            
            // Re-select the project to effectively refresh it
            onProjectSelect(updatedProject);
          }, 500);
        }
      } else {
        toast.error(scanResult.error || "Failed to scan sensor");
      }
    } catch (error) {
      toast.error("Failed to process sensor scan");
      console.error("Camera error:", error);
    } finally {
      setLoadingProjectId(null);
    }
  };

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
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  {project.location && <MapPin className="h-3 w-3" />}
                  <span className="flex items-center gap-1">
                    <Cpu className="h-3 w-3" />
                    {project.assignedSensorIds?.length || 0}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={(e) => handleCameraClick(e, project)}
                  disabled={loadingProjectId === project.id}
                >
                  {loadingProjectId === project.id ? (
                    <div className="h-3 w-3 rounded-full border-2 border-t-transparent animate-spin" />
                  ) : (
                    <Camera className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProjectsList;
