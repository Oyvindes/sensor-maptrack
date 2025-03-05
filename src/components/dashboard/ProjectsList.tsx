
import React, { useState } from "react";
import { SensorFolder } from "@/types/users";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Cpu, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { takePicture } from "@/utils/cameraUtils";
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

  const handleCameraClick = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation(); // Prevent card click event
    
    try {
      setLoadingProjectId(projectId);
      const imagePath = await takePicture();
      
      if (imagePath) {
        toast.success("Photo captured successfully");
        // Here you would typically save the image path to the project
        // This would require additional backend implementation
        console.log(`Captured image for project ${projectId}:`, imagePath);
      }
    } catch (error) {
      toast.error("Failed to capture photo");
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
                  onClick={(e) => handleCameraClick(e, project.id)}
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
