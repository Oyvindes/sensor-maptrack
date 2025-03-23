
import React from "react";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/Layout";
import { ArrowLeft } from "lucide-react";
import { SensorFolder } from "@/types/users";
import { useTranslation } from "react-i18next";

interface EditorHeaderProps {
  folder: SensorFolder;
  onCancel: () => void;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({ folder, onCancel }) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex items-center mb-4 gap-2">
      <Button variant="ghost" size="sm" onClick={onCancel}>
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <SectionTitle>
        {folder.id.startsWith("folder-") && folder.id.length > 15
          ? t('projectEditor.addNew')
          : `${t('projectEditor.edit')} ${folder.name}`}
      </SectionTitle>
    </div>
  );
};

export default EditorHeader;
