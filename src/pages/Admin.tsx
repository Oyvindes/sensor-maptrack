import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUser } from "@/services/authService";
import { getMockCompanies, getMockSensorFolders, getMockUsers } from "@/services/userService";
import { getMockDevices, getMockSensors, getMockTrackingObjects } from "@/services/sensorService";
import AdminHeader from "@/components/admin/AdminHeader";
import CompanyList from "@/components/admin/CompanyList";
import CompanyEditor from "@/components/admin/CompanyEditor";
import UserList from "@/components/admin/UserList";
import UserEditor from "@/components/admin/UserEditor";
import SensorList from "@/components/admin/SensorList";
import SensorEditor from "@/components/SensorEditor";
import DeviceList from "@/components/admin/DeviceList";
import DeviceEditor from "@/components/DeviceEditor";
import SensorFolderList from "@/components/admin/SensorFolderList";
import SensorFolderEditor from "@/components/admin/SensorFolderEditor";
import { SectionContainer, SectionTitle } from "@/components/Layout";
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

const Admin = () => {
  const [mode, setMode] = useState<
    "listCompanies" |
    "editCompany" |
    "listUsers" |
    "editUser" |
    "listSensors" |
    "editSensor" |
    "listDevices" |
    "editDevice" |
    "listFolders" |
    "editFolder"
  >("listCompanies");
  
  const [activeTab, setActiveTab] = useState<"companies" | "users" | "sensors" | "devices" | "folders">("companies");
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
  
  const currentUser = getCurrentUser();

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

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setMode("editCompany");
  };

  const handleCompanySave = (updatedCompany: Company) => {
    setCompanies(companies.map(c => c.id === updatedCompany.id ? updatedCompany : c));
    setMode("listCompanies");
    setSelectedCompany(null);
  };

  const handleCompanyCancel = () => {
    setMode("listCompanies");
    setSelectedCompany(null);
  };

  const handleAddNewCompany = () => {
    setSelectedCompany({
      id: `company-${Date.now().toString().slice(-3)}`,
      name: "",
      industry: "",
      createdAt: new Date().toISOString().split('T')[0],
      status: "active"
    });
    setMode("editCompany");
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setMode("editUser");
  };

  const handleUserSave = (updatedUser: User) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    setMode("listUsers");
    setSelectedUser(null);
  };

  const handleUserCancel = () => {
    setMode("listUsers");
    setSelectedUser(null);
  };

  const handleAddNewUser = () => {
    setSelectedUser({
      id: `user-${Date.now().toString().slice(-3)}`,
      name: "",
      email: "",
      password: "",
      role: "user",
      companyId: companies[0]?.id || "system",
      lastLogin: new Date().toISOString(),
      status: "active"
    });
    setMode("editUser");
  };

  const handleSensorSelect = (sensor: SensorData & { folderId?: string }) => {
    const enhancedSensor = {
      ...sensor,
      type: sensor.type || "temperature",
      unit: sensor.unit || "°C",
      companyId: sensor.companyId || "company-001"
    };
    
    setSelectedSensor(enhancedSensor);
    setMode("editSensor");
  };

  const handleSensorSave = (updatedSensor: SensorData & { folderId?: string; companyId?: string }) => {
    setSensors(sensors.map(s => s.id === updatedSensor.id ? updatedSensor : s));
    setMode("listSensors");
    setSelectedSensor(null);
  };

  const handleSensorCancel = () => {
    setMode("listSensors");
    setSelectedSensor(null);
  };

  const handleAddNewSensor = () => {
    setSelectedSensor({
      id: `sensor-${Date.now().toString().slice(-3)}`,
      name: "",
      type: "temperature",
      value: 0,
      unit: "°C",
      status: "online",
      lastUpdated: new Date().toLocaleTimeString(),
      companyId: companies[0]?.id || "system"
    });
    setMode("editSensor");
  };

  const handleDeviceSelect = (device: Device) => {
    setSelectedDevice(device);
    setMode("editDevice");
  };

  const handleDeviceSave = (updatedDevice: Device) => {
    setDevices(devices.map(d => d.id === updatedDevice.id ? updatedDevice : d));
    setTrackingObjects(trackingObjects.map(obj => 
      obj.id === updatedDevice.id ? mapDeviceToTrackingObject(updatedDevice) : obj
    ));
    setMode("listDevices");
    setSelectedDevice(null);
  };

  const handleDeviceCancel = () => {
    setMode("listDevices");
    setSelectedDevice(null);
  };

  const handleAddNewDevice = () => {
    setSelectedDevice({
      id: `device-${Date.now().toString().slice(-3)}`,
      name: "",
      type: "",
      status: "online",
      location: { lat: 0, lng: 0 },
      companyId: companies[0]?.id || "system"
    });
    setMode("editDevice");
  };

  const handleTrackingObjectSelect = (object: TrackingObject) => {
    const device = devices.find(d => d.id === object.id);
    if (device) {
      setSelectedDevice(device);
      setMode("editDevice");
    }
  };

  const handleFolderSelect = (folder: SensorFolder) => {
    setSelectedFolder(folder);
    setMode("editFolder");
  };

  const handleFolderSelectById = (folderId: string) => {
    const folder = sensorFolders.find(f => f.id === folderId);
    if (folder) {
      handleFolderSelect(folder);
    }
  };

  const handleFolderSave = (updatedFolder: SensorFolder) => {
    setSensorFolders(sensorFolders.map(f => f.id === updatedFolder.id ? updatedFolder : f));
    setMode("listFolders");
    setSelectedFolder(null);
  };

  const handleFolderCancel = () => {
    setMode("listFolders");
    setSelectedFolder(null);
  };

  const handleAddNewFolder = () => {
    setSelectedFolder({
      id: `folder-${Date.now().toString().slice(-3)}`,
      name: "",
      companyId: companies[0]?.id || "system",
      createdAt: new Date().toISOString().split('T')[0]
    });
    setMode("editFolder");
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as "companies" | "users" | "sensors" | "devices" | "folders");
    
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

  if (!currentUser) {
    return <div>Not authenticated</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <AdminHeader />

      <div className="container mx-auto p-4 pb-20">
        <SectionContainer>
          <SectionTitle>Admin Controls</SectionTitle>
          <p>Manage your system's data and settings.</p>
        </SectionContainer>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="sensors">Sensors</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="folders">Folders</TabsTrigger>
          </TabsList>
          
          <TabsContent value="companies">
            {mode === "listCompanies" && (
              <CompanyList
                companies={companies}
                onCompanySelect={handleCompanySelect}
                onAddNew={handleAddNewCompany}
                onViewUsers={() => {}}
              />
            )}
            {mode === "editCompany" && selectedCompany && (
              <CompanyEditor
                company={selectedCompany}
                onSave={handleCompanySave}
                onCancel={handleCompanyCancel}
              />
            )}
          </TabsContent>

          <TabsContent value="users">
            {mode === "listUsers" && (
              <UserList
                users={users}
                companies={companies}
                onUserSelect={handleUserSelect}
                onAddNew={handleAddNewUser}
              />
            )}
            {mode === "editUser" && selectedUser && (
              <UserEditor
                user={selectedUser}
                companies={companies}
                onSave={handleUserSave}
                onCancel={handleUserCancel}
              />
            )}
          </TabsContent>

          <TabsContent value="sensors">
            {mode === "listSensors" && (
              <SensorList
                sensors={sensors as any}
                onSensorSelect={handleSensorSelect as any}
                onAddNew={handleAddNewSensor}
              />
            )}
            {mode === "editSensor" && selectedSensor && (
              <SensorEditor
                sensor={selectedSensor as any}
                onSave={handleSensorSave as any}
                onCancel={handleSensorCancel}
              />
            )}
          </TabsContent>

          <TabsContent value="devices">
            {mode === "listDevices" && (
              <DeviceList
                devices={trackingObjects}
                onDeviceSelect={handleTrackingObjectSelect}
                onAddNew={handleAddNewDevice}
              />
            )}
            {mode === "editDevice" && selectedDevice && (
              <DeviceEditor
                device={selectedDevice as any}
                onSave={handleDeviceSave as any}
                onCancel={handleDeviceCancel}
              />
            )}
          </TabsContent>

          <TabsContent value="folders">
            {mode === "listFolders" && (
              <SensorFolderList
                folders={sensorFolders}
                companies={companies}
                onFolderSelect={handleFolderSelectById}
                onFolderCreate={async () => {}}
                onFolderUpdate={async () => {}}
              />
            )}
            {mode === "editFolder" && selectedFolder && (
              <SensorFolderEditor
                folder={selectedFolder}
                companies={companies}
                onSave={handleFolderSave}
                onCancel={handleFolderCancel}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
