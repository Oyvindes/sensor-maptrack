import React from "react";
import { Label } from "@/components/ui/label";
import { SensorFolder } from "@/types/users";
import { Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ProjectDatesProps {
  projectStartDate?: string;
  projectEndDate?: string;
  onChange: (field: keyof SensorFolder, value: string) => void;
}

const ProjectDates: React.FC<ProjectDatesProps> = ({
  projectStartDate,
  projectEndDate,
  onChange
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <Label htmlFor="projectStartDate">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Project Start Date</span>
            <span className="text-red-500 ml-1">*</span>
          </div>
        </Label>
        <Input
          id="projectStartDate"
          type="date"
          value={projectStartDate || ""}
          onChange={(e) => onChange("projectStartDate", e.target.value)}
          className="w-full"
          required
        />
        <p className="text-sm text-muted-foreground">
          Only data collected from this date will be displayed
        </p>
      </div>

      <div className="flex flex-col space-y-2">
        <Label htmlFor="projectEndDate">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Project End Date</span>
            <span className="text-muted-foreground ml-1">(Optional)</span>
          </div>
        </Label>
        <Input
          id="projectEndDate"
          type="date"
          value={projectEndDate || ""}
          onChange={(e) => onChange("projectEndDate", e.target.value)}
          className="w-full"
          min={projectStartDate || undefined}
        />
        {projectStartDate && projectEndDate && new Date(projectEndDate) < new Date(projectStartDate) && (
          <p className="text-red-500 text-sm mt-1">
            End date cannot be before start date
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          If set, data collection will automatically stop on this date
        </p>
      </div>
    </div>
  );
};

export default ProjectDates;