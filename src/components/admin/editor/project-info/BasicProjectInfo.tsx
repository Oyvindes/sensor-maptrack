
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SensorFolder } from "@/types/users";
import { Hash } from "lucide-react";

interface BasicProjectInfoProps {
  name: string;
  projectNumber: string | undefined;
  onChange: (field: keyof SensorFolder, value: string) => void;
}

const BasicProjectInfo: React.FC<BasicProjectInfoProps> = ({
  name,
  projectNumber,
  onChange
}) => {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">Project Name</Label>
        <Input
          id="name"
          value={name}
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
          value={projectNumber || ""}
          onChange={(e) => onChange("projectNumber", e.target.value)}
          placeholder="e.g., PRJ-2023-001"
        />
      </div>
    </div>
  );
};

export default BasicProjectInfo;
