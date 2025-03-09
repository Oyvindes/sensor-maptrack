
import { useState, useEffect } from "react";
import { getMockCompanies } from "@/services/company/companyService";
import { getMockUsers } from "@/services/user/userService";
import { getMockDevices, getMockSensors, getMockTrackingObjects } from "@/services/sensorService";
import { mapDeviceToTrackingObject } from "@/services/device/mockDeviceData";
import { Company, User, SensorFolder } from "@/types/users";
import { Device, Sensor, TrackingObject } from "@/types/sensors";
import { SensorData } from "@/components/SensorCard";

export type AdminMode = 
  "listCompanies" |
  "editCompany" |
  "listUsers" |
  "editUser" |
  "listSensors" |
  "editSensor" |
  "listDevices" |
  "editDevice" |
  "listFolders" |
  "editFolder";

export type AdminTab = "companies" | "users" | "sensors" | "devices" | "folders";

export function useAdminState() {
  const [mode, setMode] = useState<AdminMode>("listCompanies");
  const [activeTab, setActiveTab] = useState<AdminTab>("companies");
  
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedSensor, setSelectedSensor] = useState<SensorData & { folderId?: string; companyId?: string } | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<SensorFolder | null>(null);
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sensors, setSensors] = useState<(SensorData & { folderId?: string; companyId?: string })[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [trackingObjects, setTrackingObjects] = useState<TrackingObject[]>([]);
  const [sensorFolders, setSensorFolders] = useState<SensorFolder[]>([]);

  useEffect(() => {
    // Get companies and users
    setCompanies(getMockCompanies());
    setUsers(getMockUsers());
    
    // Fetch sensors (async)
    const fetchSensors = async () => {
      try {
        const sensorsData = await getMockSensors();
        // Make sure all sensors have the values property properly set
        setSensors(sensorsData.map(sensor => {
          // Ensure sensor has values array and add folderId if it exists
          if (!sensor.values || !Array.isArray(sensor.values)) {
            // Convert old format to new format if needed
            return {
              ...sensor,
              values: [{
                type: "temperature",
                value: 0,
                unit: "°C"
              }]
            };
          }
          return sensor;
        }));
      } catch (error) {
        console.error("Error fetching sensors:", error);
      }
    };
    
    fetchSensors();
    
    // Get devices and tracking objects
    const deviceData = getMockDevices();
    setDevices(deviceData);
    setTrackingObjects(deviceData.map(mapDeviceToTrackingObject));
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value as AdminTab);
    
    switch (value) {
      case "companies":
        setMode("listCompanies");
        break;
      case "users":
        setMode("listUsers");
        break;
      case "sensors":
        setMode("listSensors");
        break;
      case "devices":
        setMode("listDevices");
        break;
      case "folders":
        setMode("listFolders");
        break;
    }
  };

  return {
    mode,
    setMode,
    activeTab,
    setActiveTab,
    selectedCompany,
    setSelectedCompany,
    selectedUser,
    setSelectedUser,
    selectedSensor,
    setSelectedSensor,
    selectedDevice,
    setSelectedDevice,
    selectedFolder,
    setSelectedFolder,
    companies,
    setCompanies,
    users,
    setUsers,
    sensors,
    setSensors,
    devices,
    setDevices,
    trackingObjects,
    setTrackingObjects,
    sensorFolders,
    setSensorFolders,
    handleTabChange
  };
}
