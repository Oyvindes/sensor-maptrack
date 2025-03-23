import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SectionTitle } from "@/components/Layout";
import { useTranslation } from "react-i18next";

interface FolderListHeaderProps {
  onAddNew: () => void;
}

const FolderListHeader: React.FC<FolderListHeaderProps> = ({ onAddNew }) => {
  const { t } = useTranslation();
  
  return (
    <>
      <SectionTitle className="mb-2">{t('projects.title')}</SectionTitle>
      <div className="flex justify-start mb-6">
        <Button size="sm" onClick={onAddNew} className="h-12 px-4">
          <span className="flex flex-col items-center gap-1">
            <Plus className="h-4 w-4" />
            <span className="text-[10px]">{t('buttons.new')}</span>
          </span>
        </Button>
      </div>
    </>
  );
};

export default FolderListHeader;
