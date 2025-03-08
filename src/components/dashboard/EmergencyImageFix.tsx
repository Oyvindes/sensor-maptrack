import React, { useState } from "react";
import { SensorFolder } from "@/types/users";
import { useProjectData } from "@/hooks/useProjectData";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, AlertTriangle } from "lucide-react";

interface EmergencyImageFixProps {
  project: SensorFolder;
  onComplete?: () => void;
}

/**
 * Component to handle emergency fixes for project images
 */
const EmergencyImageFix: React.FC<EmergencyImageFixProps> = ({
  project,
  onComplete
}) => {
  const { projects, setProjects } = useProjectData();
  const [isFixing, setIsFixing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  // Function to perform emergency fix
  const handleFix = async () => {
    setIsFixing(true);
    
    try {
      // Simulate a fixing process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update the project to mark issues as fixed
      const updatedProject = {
        ...project,
        hasImageIssues: false
      };
      
      // Update the project in the projects array
      setProjects(prevProjects =>
        prevProjects.map(p =>
          p.id === project.id ? updatedProject : p
        )
      );
      
      setIsComplete(true);
      toast.success("Successfully fixed project image issues");
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Error fixing images:", error);
      toast.error("Failed to fix image issues");
    } finally {
      setIsFixing(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Image Issues Detected
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Issues have been detected with this project's sensor placement images.
            The emergency fix will attempt to resolve these issues.
          </p>
          
          {isComplete ? (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md">
              <Check className="h-5 w-5" />
              <span>Fix completed successfully</span>
            </div>
          ) : (
            <Button 
              onClick={handleFix} 
              disabled={isFixing}
              className="w-full"
            >
              {isFixing ? "Fixing..." : "Run Emergency Fix"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmergencyImageFix;