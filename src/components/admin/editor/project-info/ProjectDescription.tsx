
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SensorFolder } from "@/types/users";
import { useTranslation } from "react-i18next";

interface ProjectDescriptionProps {
  description: string | undefined;
  onChange: (field: keyof SensorFolder, value: string) => void;
}

const ProjectDescription: React.FC<ProjectDescriptionProps> = ({
  description,
  onChange
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-2">
      <Label htmlFor="description">{t('projectEditor.description')}</Label>
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
