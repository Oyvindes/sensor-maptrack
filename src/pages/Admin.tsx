
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUser } from "@/services/authService";
import { getMockCompanies, getMockSensorFolders } from "@/services/userService";
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
import { Device, Sensor } from "@/types/sensors";
import ModeSwitcher from "@/components/admin/ModeSwitcher";
import { getMockUsers } from "@/services/userService";
import { SensorData } from "@/components/SensorCard";

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
  
  const [currentAdminMode, setCurrentAdminMode] = useState<"sensors" | "devices" | "users" | "folders">("sensors");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedSensor, setSelectedSensor] = useState<SensorData & { folderId?: string; companyId?: string } | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<SensorFolder | null>(null);
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sensors, setSensors] = useState<(SensorData & { folderId?: string; companyId?: string })[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [sensorFolders, setSensorFolders] = useState<SensorFolder[]>([]);
  
  const currentUser = getCurrentUser();

  useEffect(() => {
    // Fetch mock data on component mount
    setCompanies(getMockCompanies());
    setUsers(getMockUsers());
    setSensors(getMockSensors().map(sensor => ({
      ...sensor,
      companyId: "company-001" // Adding the required companyId property
    })));
    setDevices(getMockDevices());
    setSensorFolders(getMockSensorFolders());
  }, []);

  // Handlers for company operations
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

  // Handlers for user operations
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

  // Handlers for sensor operations
  const handleSensorSelect = (sensor: SensorData & { folderId?: string; companyId?: string }) => {
    setSelectedSensor(sensor);
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

  // Handlers for device operations
  const handleDeviceSelect = (device: Device) => {
    setSelectedDevice(device);
    setMode("editDevice");
  };

  const handleDeviceSave = (updatedDevice: Device) => {
    setDevices(devices.map(d => d.id === updatedDevice.id ? updatedDevice : d));
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

  // Handlers for folder operations
  const handleFolderSelect = (folder: SensorFolder) => {
    setSelectedFolder(folder);
    setMode("editFolder");
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

  // Handle mode change for the ModeSwitcher
  const handleModeChange = (newMode: "sensors" | "devices" | "users" | "folders") => {
    setCurrentAdminMode(newMode);
    switch (newMode) {
      case "sensors":
        setMode("listSensors");
        break;
      case "devices":
        setMode("listDevices");
        break;
      case "users":
        setMode("listUsers");
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

      <div className="container mx-auto p-4">
        <SectionContainer>
          <SectionTitle>Admin Controls</SectionTitle>
          <p>Manage your system's data and settings.</p>
        </SectionContainer>

        <Tabs defaultValue="companies" className="w-full">
          <TabsList>
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
                onViewUsers={() => {}} // Adding required prop
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
                companies={companies} // Adding required prop
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
                sensors={sensors}
                onSensorSelect={handleSensorSelect}
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
                devices={devices}
                onDeviceSelect={handleDeviceSelect}
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
                onFolderSelect={handleFolderSelect}
                onAddNew={handleAddNewFolder}
              />
            )}
            {mode === "editFolder" && selectedFolder && (
              <SensorFolderEditor
                folder={selectedFolder}
                companies={companies} // Adding required prop
                onSave={handleFolderSave}
                onCancel={handleFolderCancel}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      <ModeSwitcher 
        currentMode={currentAdminMode}
        onModeChange={handleModeChange}
      />
    </div>
  );
};

export default Admin;
