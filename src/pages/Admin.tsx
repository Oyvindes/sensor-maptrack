import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUser } from "@/services/authService";
import { getMockCompanies, getMockSensorFolders } from "@/services/userService";
import { getMockDevices, getMockSensors } from "@/services/sensorService";
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
import { TrackingObject } from "@/types/sensors";
import ModeSwitcher from "@/components/admin/ModeSwitcher";

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
  
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<TrackingObject | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<SensorFolder | null>(null);
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [devices, setDevices] = useState<TrackingObject[]>([]);
  const [sensorFolders, setSensorFolders] = useState<SensorFolder[]>([]);
  
  const currentUser = getCurrentUser();

  useEffect(() => {
    // Fetch mock data on component mount
    setCompanies(getMockCompanies());
    setUsers(getMockUsers());
    setSensors(getMockSensors());
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
  const handleSensorSelect = (sensor: Sensor) => {
    setSelectedSensor(sensor);
    setMode("editSensor");
  };

  const handleSensorSave = (updatedSensor: Sensor) => {
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
      companyId: companies[0]?.id || "system",
      id: `sensor-${Date.now().toString().slice(-3)}`,
      name: "",
      type: "",
      unit: "",
      status: "active"
    });
    setMode("editSensor");
  };

  // Handlers for device operations
  const handleDeviceSelect = (device: TrackingObject) => {
    setSelectedDevice(device);
    setMode("editDevice");
  };

  const handleDeviceSave = (updatedDevice: TrackingObject) => {
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
      position: { lat: 0, lng: 0 },
      lastUpdated: new Date().toISOString(),
      speed: 0,
      direction: 0,
      batteryLevel: 100
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
                sensor={selectedSensor}
                onSave={handleSensorSave}
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
                device={selectedDevice}
                onSave={handleDeviceSave}
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
                onSave={handleFolderSave}
                onCancel={handleFolderCancel}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      <ModeSwitcher />
    </div>
  );
};

export default Admin;
