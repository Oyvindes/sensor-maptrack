
import React from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface EditorActionButtonsProps {
  onCancel: () => void;
}

const EditorActionButtons: React.FC<EditorActionButtonsProps> = ({ onCancel }) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex justify-end gap-2 pt-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        {t('projectEditor.cancel')}
      </Button>
      <Button type="submit" variant="outline">
        {t('projectEditor.save')}
      </Button>
    </div>
  );
};

export default EditorActionButtons;
