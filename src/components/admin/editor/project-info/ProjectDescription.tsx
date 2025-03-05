
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SensorFolder } from "@/types/users";

interface ProjectDescriptionProps {
  description: string | undefined;
  onChange: (field: keyof SensorFolder, value: string) => void;
}

const ProjectDescription: React.FC<ProjectDescriptionProps> = ({
  description,
  onChange
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="description">Description (Optional)</Label>
      <Textarea
        id="description"
        value={description || ""}
        onChange={(e) => onChange("description" as keyof SensorFolder, e.target.value)}
        rows={3}
      />
    </div>
  );
};

export default ProjectDescription;
