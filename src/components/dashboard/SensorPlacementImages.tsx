import React, { useState } from "react";
import { SensorFolder } from "@/types/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, CheckCircle } from "lucide-react";
import EmergencyFixButton from "./EmergencyFixButton";
import { toast } from "sonner";

interface SensorPlacementImagesProps {
  project: SensorFolder;
  onUpdateProject?: (updatedProject: SensorFolder) => void;
}

/**
 * Component to display and manage sensor placement images for a project
 */
const SensorPlacementImages: React.FC<SensorPlacementImagesProps> = ({
  project,
  onUpdateProject
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [images, setImages] = useState<string[]>(project.sensorImages || []);

  // Mock function to handle image upload
  const handleImageUpload = () => {
    setIsUploading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const newImage = `https://picsum.photos/400/300?random=${Date.now()}`;
      const updatedImages = [...images, newImage];
      setImages(updatedImages);
      
      // Update project with new images
      if (onUpdateProject) {
        const updatedProject = {
          ...project,
          sensorImages: updatedImages
        };
        onUpdateProject(updatedProject);
      }
      
      setIsUploading(false);
      toast.success("Sensor placement image uploaded");
    }, 1500);
  };

  // Handle emergency fixes for images
  const handleFixImages = (project: SensorFolder) => {
    toast.success("Running image fix process...");
    
    // Simulate fixing images
    setTimeout(() => {
      if (onUpdateProject) {
        const updatedProject = {
          ...project,
          hasImageIssues: false
        };
        onUpdateProject(updatedProject);
        toast.success("Image issues resolved");
      }
    }, 2000);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Sensor Placement Images</CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleImageUpload}
              disabled={isUploading}
            >
              <Camera className="h-4 w-4 mr-1" />
              {isUploading ? "Uploading..." : "Upload Image"}
            </Button>
            
            {/* Emergency fix button with required onFix prop */}
            <EmergencyFixButton 
              project={project} 
              onFix={handleFixImages}
              disabled={!project.hasImageIssues}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {images.length === 0 ? (
          <div className="text-center p-6 bg-muted/50 rounded-md">
            <p className="text-muted-foreground">No sensor placement images uploaded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {images.map((imageUrl, index) => (
              <div key={index} className="relative rounded-md overflow-hidden border">
                <img 
                  src={imageUrl} 
                  alt={`Sensor placement ${index + 1}`} 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-white/90 p-1 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SensorPlacementImages;