
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SectionTitle } from "@/components/Layout";

interface FolderListHeaderProps {
  onAddNew: () => void;
}

const FolderListHeader: React.FC<FolderListHeaderProps> = ({ onAddNew }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <SectionTitle>Projects</SectionTitle>
      <Button size="sm" onClick={onAddNew}>
        <Plus className="h-4 w-4 mr-1" /> Add Project
      </Button>
    </div>
  );
};

export default FolderListHeader;
