
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SensorFolder } from "@/types/users";
import { Hash, MapPin } from "lucide-react";

interface ProjectInfoFieldsProps {
  formData: SensorFolder;
  onChange: (field: keyof SensorFolder, value: string) => void;
}

const ProjectInfoFields: React.FC<ProjectInfoFieldsProps> = ({
  formData,
  onChange
}) => {
  return (
    <>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Project Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onChange("name", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="projectNumber">
            <div className="flex items-center gap-1">
              <Hash className="h-4 w-4" />
              <span>Project Number</span>
            </div>
          </Label>
          <Input
            id="projectNumber"
            value={formData.projectNumber || ""}
            onChange={(e) => onChange("projectNumber", e.target.value)}
            placeholder="e.g., PRJ-2023-001"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>Project Address</span>
          </div>
        </Label>
        <Input
          id="address"
          value={formData.address || ""}
          onChange={(e) => onChange("address", e.target.value)}
          placeholder="Full address of the project location"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={formData.description || ""}
          onChange={(e) => onChange("description", e.target.value)}
          rows={3}
        />
      </div>
    </>
  );
};

export default ProjectInfoFields;
