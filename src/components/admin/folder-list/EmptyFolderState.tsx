
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface EmptyFolderStateProps {
  hasSelectedCompany: boolean;
}

const EmptyFolderState: React.FC<EmptyFolderStateProps> = ({ 
  hasSelectedCompany 
}) => {
  return (
    <Alert className="mb-4">
      <AlertTitle>No projects found</AlertTitle>
      <AlertDescription>
        {hasSelectedCompany 
          ? "This company doesn't have any projects yet. Create your first project to organize sensors."
          : "No projects found. Select a company or create a new project."}
      </AlertDescription>
    </Alert>
  );
};

export default EmptyFolderState;
