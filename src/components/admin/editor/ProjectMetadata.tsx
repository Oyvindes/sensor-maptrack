
import React from "react";
import { UserRound, Clock } from "lucide-react";

interface ProjectMetadataProps {
  creatorName?: string;
  createdAt?: string;
}

const ProjectMetadata: React.FC<ProjectMetadataProps> = ({
  creatorName,
  createdAt
}) => {
  if (!creatorName && !createdAt) return null;
  
  return (
    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
        {creatorName && (
          <div className="flex items-center gap-2">
            <UserRound className="h-4 w-4" />
            <span>Created by: {creatorName}</span>
          </div>
        )}
        {createdAt && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Created on: {createdAt}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectMetadata;
