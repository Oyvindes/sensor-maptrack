
import React from "react";
import { UserRound, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ProjectMetadataProps {
  creatorName?: string;
  createdAt?: string;
}
const ProjectMetadata: React.FC<ProjectMetadataProps> = ({
  creatorName,
  createdAt
}) => {
  const { t } = useTranslation();
  
  if (!creatorName && !createdAt) return null;
  
  return (
    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
        {creatorName && (
          <div className="flex items-center gap-2">
            <UserRound className="h-4 w-4" />
            <span>{t('projectEditor.createdBy')} {creatorName}</span>
          </div>
        )}
        {createdAt && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{t('projectEditor.createdOn')} {createdAt}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectMetadata;
