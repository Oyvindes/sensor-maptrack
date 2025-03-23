
import React from "react";
import { Button } from "@/components/ui/button";

interface EditorActionButtonsProps {
  onCancel: () => void;
}

const EditorActionButtons: React.FC<EditorActionButtonsProps> = ({ onCancel }) => {
  return (
    <div className="flex justify-end gap-2 pt-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" variant="outline">
        Save Changes
      </Button>
    </div>
  );
};

export default EditorActionButtons;
