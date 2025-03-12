
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
import { useTrackingObjects } from "@/hooks/useTrackingObjects";
import { Toaster } from "sonner";

// Tab components
import CompaniesTab from "@/components/admin/tabs/CompaniesTab";
import UsersTab from "@/components/admin/tabs/UsersTab";
import SensorsTab from "@/components/admin/tabs/SensorsTab";
import DevicesTab from "@/components/admin/tabs/DevicesTab";

const Admin = () => {
  const adminState = useAdminState();
  const {
    mode, activeTab, companies, users, sensors, devices, trackingObjects,
    selectedCompany, selectedUser, selectedSensor, selectedDevice,
    setMode, setSelectedCompany, setSelectedUser, setSelectedSensor, setSelectedDevice,
    setCompanies, setUsers, setSensors, setDevices, setTrackingObjects,
    handleTabChange
  } = adminState;

  // Get tracking functionality including the update and delete functions
  const { updateTrackingObject, deleteTrackingObject } = useTrackingObjects();

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
    setSelectedDevice, setMode, companies, updateTrackingObject, deleteTrackingObject
  );
  
  const currentUser = getCurrentUser();

  useEffect(() => {
    // If the tab was set to folders, change it to companies
    // Using as AdminTab to ensure type safety
    if (activeTab === "folders" as any) {
      handleTabChange('companies');
    }
  }, [activeTab, handleTabChange]);

  if (!currentUser) {
    return <div>Not authenticated</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <AdminHeader />
      <Toaster position="top-right" />

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
            <TabsTrigger value="devices">Asset Tracking</TabsTrigger>
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
              companies={companies}
              onSensorSelect={sensorHandlers.handleSensorSelect}
              onSensorSave={sensorHandlers.handleSensorSave}
              onSensorCancel={sensorHandlers.handleSensorCancel}
              onAddNewSensor={sensorHandlers.handleAddNewSensor}
              onImportSensors={sensorHandlers.handleImportSensors}
              onDeleteByCsv={sensorHandlers.handleDeleteSensors}
              setMode={setMode}
            />
          </TabsContent>

          <TabsContent value="devices">
            <DevicesTab
              mode={mode}
              trackingObjects={trackingObjects}
              selectedDevice={selectedDevice}
              companies={companies}
              onDeviceSelect={deviceHandlers.handleTrackingObjectSelect}
              onDeviceSave={deviceHandlers.handleDeviceSave}
              onDeviceCancel={deviceHandlers.handleDeviceCancel}
              onAddNewDevice={deviceHandlers.handleAddNewDevice}
              onDeviceDelete={deviceHandlers.handleDeviceDelete}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
