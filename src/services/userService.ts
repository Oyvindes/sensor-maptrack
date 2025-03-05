
// Re-export all service functions from the refactored files
// This maintains backward compatibility with existing imports

// Company services
export { 
  getMockCompanies, 
  updateCompany 
} from './company/companyService';

// User services
export { 
  getMockUsers, 
  updateUser 
} from './user/userService';

// Folder services
export { 
  getMockSensorFolders, 
  createSensorFolder, 
  updateSensorFolder 
} from './folder/folderService';
