
// Make sure to include the export for deleteProject here
export { 
  deleteProject,
  fetchSensorFolders as getMockSensorFolders,
  fetchSensorFolders as getSensorFolders,
  saveSensorFolder as createSensorFolder,
  saveSensorFolder as updateSensorFolder,
  deleteSensorFolder as deleteFolder
} from './supabaseFolderService';
