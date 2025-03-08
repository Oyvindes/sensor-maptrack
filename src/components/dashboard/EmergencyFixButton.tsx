import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRightCircle } from "lucide-react"; 
import { SensorFolder } from "@/types/users";

interface EmergencyFixButtonProps {
  project: SensorFolder;
  onFix: (project: SensorFolder) => void;
  disabled?: boolean;
}

/**
 * Emergency fix button component used for fixing project issues
 */
const EmergencyFixButton: React.FC<EmergencyFixButtonProps> = ({
  project,
  onFix,
  disabled = false
}) => {
  const handleFix = () => {
    console.log("Emergency fix requested for project:", project.id);
    onFix(project);
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      className="flex items-center gap-1"
      onClick={handleFix}
      disabled={disabled}
    >
      <ArrowRightCircle className="h-4 w-4" />
      <span>Fix Issues</span>
    </Button>
  );
};

export default EmergencyFixButton;