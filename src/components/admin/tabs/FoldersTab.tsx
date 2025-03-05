
import React from "react";
import { SensorFolder, Company } from "@/types/users";
import SensorFolderList from "@/components/admin/SensorFolderList";
import SensorFolderEditor from "@/components/admin/SensorFolderEditor";

interface FoldersTabProps {
  mode: string;
  sensorFolders: SensorFolder[];
  companies: Company[];
  selectedFolder: SensorFolder | null;
  onFolderSelect: (folderId: string) => void;
  onFolderSave: (folder: SensorFolder) => void;
  onFolderCancel: () => void;
}

const FoldersTab: React.FC<FoldersTabProps> = ({
  mode,
  sensorFolders,
  companies,
  selectedFolder,
  onFolderSelect,
  onFolderSave,
  onFolderCancel
}) => {
  return (
    <>
      {mode === "listFolders" && (
        <SensorFolderList
          folders={sensorFolders}
          companies={companies}
          onFolderSelect={onFolderSelect}
          onFolderCreate={async () => {}}
          onFolderUpdate={async () => {}}
        />
      )}
      {mode === "editFolder" && selectedFolder && (
        <SensorFolderEditor
          folder={selectedFolder}
          companies={companies}
          onSave={onFolderSave}
          onCancel={onFolderCancel}
        />
      )}
    </>
  );
};

export default FoldersTab;
