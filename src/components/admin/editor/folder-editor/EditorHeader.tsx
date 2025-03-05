
import React from "react";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/Layout";
import { ArrowLeft } from "lucide-react";
import { SensorFolder } from "@/types/users";

interface EditorHeaderProps {
  folder: SensorFolder;
  onCancel: () => void;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({ folder, onCancel }) => {
  return (
    <div className="flex items-center mb-4 gap-2">
      <Button variant="ghost" size="sm" onClick={onCancel}>
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <SectionTitle>
        {folder.id.startsWith("folder-") && folder.id.length > 15 
          ? "Add New Project" 
          : `Edit Project: ${folder.name}`}
      </SectionTitle>
    </div>
  );
};

export default EditorHeader;
