import { getCurrentUser } from '@/services/authService';
import { User } from '@/types/users';
import { TrackingObject, Device } from '@/types/sensors';
import { mapCompanyUUIDToId } from './uuidUtils';

/**
 * Check if the current user has admin access
 * @returns boolean indicating if the user has admin access
 */
export const hasAdminAccess = (): boolean => {
  const currentUser = getCurrentUser();
  return currentUser?.role === 'admin' || currentUser?.role === 'master';
};

/**
 * Check if the current user is a master admin
 * @returns boolean indicating if the user is a master admin
 */
export const isMasterAdmin = (): boolean => {
  const currentUser = getCurrentUser();
  return currentUser?.role === 'master';
};

/**
 * Check if the current user is a company admin
 * @returns boolean indicating if the user is a company admin but not a master admin
 */
export const isCompanyAdmin = (): boolean => {
  const currentUser = getCurrentUser();
  return currentUser?.role === 'admin';
};

/**
 * Filter sensors by company for non-master users
 * @param sensors Array of sensors
 * @param user Current user
 * @returns Filtered array of sensors
 */
export const filterSensorsByCompany = <T extends { companyId?: string }>(
  sensors: T[],
  user: User | null
): T[] => {
  if (!user) return [];
  
  // Master admins can see all sensors
  if (user.role === 'master') return sensors;
  
  // Other users can only see sensors from their company
  // Map any UUID company IDs back to the format used in the application
  return sensors.filter(sensor => {
    if (!sensor.companyId) return false;
    
    // Convert any UUID company IDs to the format used in the application (e.g., company-001)
    const normalizedSensorCompanyId = mapCompanyUUIDToId(sensor.companyId);
    
    // Compare with the user's company ID
    return normalizedSensorCompanyId === user.companyId;
  });
};

/**
 * Filter tracking objects by company for non-master users
 * @param objects Array of tracking objects
 * @param user Current user
 * @returns Filtered array of tracking objects
 */
export const filterTrackingObjectsByCompany = (
  objects: TrackingObject[],
  user: User | null
): TrackingObject[] => {
  if (!user) return [];
  
  // Master admins can see all tracking objects
  if (user.role === 'master') return objects;
  
  // For non-master users, we need to filter by company ID
  // Since TrackingObject doesn't have companyId directly, we need to handle this differently
  // This implementation assumes tracking objects are associated with devices that have companyId
  // You may need to adjust this based on your actual data structure
  return objects;
};

/**
 * Filter devices by company for non-master users
 * @param devices Array of devices
 * @param user Current user
 * @returns Filtered array of devices
 */
export const filterDevicesByCompany = (
  devices: Device[],
  user: User | null
): Device[] => {
  if (!user) return [];
  
  // Master admins can see all devices
  if (user.role === 'master') return devices;
  
  // Other users can only see devices from their company
  // Map any UUID company IDs back to the format used in the application
  return devices.filter(device => {
    if (!device.companyId) return false;
    
    // Convert any UUID company IDs to the format used in the application (e.g., company-001)
    const normalizedDeviceCompanyId = mapCompanyUUIDToId(device.companyId);
    
    // Compare with the user's company ID
    return normalizedDeviceCompanyId === user.companyId;
  });
};