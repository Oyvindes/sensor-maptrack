
import { useState, useEffect } from "react";
import { getMockCompanies, getMockSensorFolders, getMockUsers } from "@/services/userService";
import { getMockDevices, getMockSensors, getMockTrackingObjects } from "@/services/sensorService";
import { Company, User, SensorFolder } from "@/types/users";
import { Device, Sensor, TrackingObject } from "@/types/sensors";
import { SensorData } from "@/components/SensorCard";

const mapDeviceToTrackingObject = (device: Device): TrackingObject => {
  return {
    id: device.id,
    name: device.name,
    position: device.location || { lat: 0, lng: 0 },
    lastUpdated: new Date().toLocaleTimeString(),
    speed: 0,
    direction: 0,
    batteryLevel: 100,
  };
};

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
    setCompanies(getMockCompanies());
    setUsers(getMockUsers());
    
    setSensors(getMockSensors().map(sensor => ({
      ...sensor,
      type: sensor.type || "temperature",
      unit: sensor.unit || "°C"
    })));
    
    const deviceData = getMockDevices();
    setDevices(deviceData);
    setTrackingObjects(deviceData.map(mapDeviceToTrackingObject));
    setSensorFolders(getMockSensorFolders());
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
    // State
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
    // Handlers
    handleTabChange
  };
}
