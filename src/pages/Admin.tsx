
import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUser } from "@/services/authService";
import AdminHeader from "@/components/admin/AdminHeader";
import { SectionContainer, SectionTitle } from "@/components/Layout";
import { useAdminState } from "@/hooks/useAdminState";
import { useCompanyHandlers } from "@/components/admin/handlers/CompanyHandlers";
import { useUserHandlers } from "@/components/admin/handlers/UserHandlers";
import { useSensorHandlers } from "@/components/admin/handlers/SensorHandlers";
import { useDeviceHandlers } from "@/components/admin/handlers/DeviceHandlers";
import { useFolderHandlers } from "@/components/admin/handlers/FolderHandlers";

// Tab components
import CompaniesTab from "@/components/admin/tabs/CompaniesTab";
import UsersTab from "@/components/admin/tabs/UsersTab";
import SensorsTab from "@/components/admin/tabs/SensorsTab";
import DevicesTab from "@/components/admin/tabs/DevicesTab";
import FoldersTab from "@/components/admin/tabs/FoldersTab";

const Admin = () => {
  const adminState = useAdminState();
  const {
    mode, activeTab, companies, users, sensors, devices, trackingObjects, sensorFolders,
    selectedCompany, selectedUser, selectedSensor, selectedDevice, selectedFolder,
    setMode, setSelectedCompany, setSelectedUser, setSelectedSensor, setSelectedDevice, setSelectedFolder,
    setCompanies, setUsers, setSensors, setDevices, setTrackingObjects, setSensorFolders,
    handleTabChange
  } = adminState;

  const companyHandlers = useCompanyHandlers(
    companies, setCompanies, setSelectedCompany, setMode
  );

  const userHandlers = useUserHandlers(
    users, companies, setUsers, setSelectedUser, setMode
  );

  const sensorHandlers = useSensorHandlers(
    sensors, setSensors, setSelectedSensor, setMode, companies
  );

  const deviceHandlers = useDeviceHandlers(
    devices, trackingObjects, setDevices, setTrackingObjects, 
    setSelectedDevice, setMode, companies
  );

  const folderHandlers = useFolderHandlers(
    sensorFolders, setSensorFolders, setSelectedFolder, setMode, companies
  );
  
  const currentUser = getCurrentUser();

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
            <CompaniesTab
              mode={mode}
              companies={companies}
              selectedCompany={selectedCompany}
              onCompanySelect={companyHandlers.handleCompanySelect}
              onCompanySave={companyHandlers.handleCompanySave}
              onCompanyCancel={companyHandlers.handleCompanyCancel}
              onAddNewCompany={companyHandlers.handleAddNewCompany}
              canCreateCompany={companyHandlers.canCreateCompany}
            />
          </TabsContent>

          <TabsContent value="users">
            <UsersTab
              mode={mode}
              users={users}
              companies={companies}
              selectedUser={selectedUser}
              onUserSelect={userHandlers.handleUserSelect}
              onUserSave={userHandlers.handleUserSave}
              onUserCancel={userHandlers.handleUserCancel}
              onAddNewUser={userHandlers.handleAddNewUser}
            />
          </TabsContent>

          <TabsContent value="sensors">
            <SensorsTab
              mode={mode}
              sensors={sensors}
              selectedSensor={selectedSensor}
              folders={sensorFolders}
              onSensorSelect={sensorHandlers.handleSensorSelect}
              onSensorSave={sensorHandlers.handleSensorSave}
              onSensorCancel={sensorHandlers.handleSensorCancel}
              onAddNewSensor={sensorHandlers.handleAddNewSensor}
            />
          </TabsContent>

          <TabsContent value="devices">
            <DevicesTab
              mode={mode}
              trackingObjects={trackingObjects}
              selectedDevice={selectedDevice}
              folders={sensorFolders}
              onDeviceSelect={deviceHandlers.handleTrackingObjectSelect}
              onDeviceSave={deviceHandlers.handleDeviceSave}
              onDeviceCancel={deviceHandlers.handleDeviceCancel}
              onAddNewDevice={deviceHandlers.handleAddNewDevice}
            />
          </TabsContent>

          <TabsContent value="folders">
            <FoldersTab
              mode={mode}
              sensorFolders={sensorFolders}
              companies={companies}
              selectedFolder={selectedFolder}
              onFolderSelect={folderHandlers.handleFolderSelectById}
              onFolderSave={folderHandlers.handleFolderSave}
              onFolderCancel={folderHandlers.handleFolderCancel}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
