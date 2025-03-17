
// Re-export all service functions from the refactored files
// This maintains backward compatibility with existing imports

// Company services
export { 
  getAllCompanies as getMockCompanies, 
  updateCompany 
} from './company/mockCompanyService';

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
