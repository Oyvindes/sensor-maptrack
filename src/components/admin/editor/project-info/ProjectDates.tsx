import React from "react";
import { Label } from "@/components/ui/label";
import { SensorFolder } from "@/types/users";
import { Calendar } from "lucide-react";
import { DateTimePicker } from "@/components/ui/date-time-picker";
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
            <span>Project Start Date & Time</span>
            <span className="text-red-500 ml-1">*</span>
          </div>
        </Label>
        <DateTimePicker
          date={projectStartDate ? new Date(projectStartDate) : undefined}
          setDate={(date) => {
            // Ensure we're saving the full ISO string with time information
            onChange("projectStartDate", date ? date.toISOString() : "");
          }}
          placeholder="Select start date and time"
          disabled={false}
          className="w-full"
        />
        <p className="text-sm text-muted-foreground">
          Only data collected from this date and time will be displayed
        </p>
      </div>

      <div className="flex flex-col space-y-2">
        <Label htmlFor="projectEndDate">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Project End Date & Time</span>
            <span className="text-muted-foreground ml-1">(Optional)</span>
          </div>
        </Label>
        <DateTimePicker
          date={projectEndDate ? new Date(projectEndDate) : undefined}
          setDate={(date) => {
            // Ensure we're saving the full ISO string with time information
            onChange("projectEndDate", date ? date.toISOString() : "");
          }}
          placeholder="Select end date and time (optional)"
          disabled={false}
          className="w-full"
        />
        {projectStartDate && projectEndDate && new Date(projectEndDate) < new Date(projectStartDate) && (
          <p className="text-red-500 text-sm mt-1">
            End date and time cannot be before start date and time
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          If set, data collection will automatically stop on this date and time
        </p>
      </div>
    </div>
  );
};

export default ProjectDates;