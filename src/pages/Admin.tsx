import { useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUser } from "@/services/authService";
import { Building2, Users, Radar, Database } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { SectionContainer, SectionTitle } from "@/components/Layout";
import { useAdminState } from "@/hooks/useAdminState";
import { useCompanyHandlers } from "@/components/admin/handlers/CompanyHandlers";
import { useUserHandlers } from "@/components/admin/handlers/UserHandlers";
import { useSensorHandlers } from "@/components/admin/handlers/SensorHandlers";
import { useDeviceHandlers } from "@/components/admin/handlers/DeviceHandlers";
import { useTrackingObjects } from "@/hooks/useTrackingObjects";
import { Toaster } from "sonner";
import { isMasterAdmin, filterSensorsByCompany, filterTrackingObjectsByCompany } from "@/utils/authUtils";

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
  const { updateTrackingObject, deleteTrackingObject, devices: trackedDevices, trackingObjects: trackedObjects, fetchData: fetchTrackingData } = useTrackingObjects();
  
  // Sync tracking objects from the database to the admin state
  useEffect(() => {
    if (trackedDevices.length > 0 || trackedObjects.length > 0) {
      setDevices(trackedDevices);
      setTrackingObjects(trackedObjects);
    }
  }, [trackedDevices, trackedObjects, setDevices, setTrackingObjects]);
  
  // Fetch tracking data when the devices tab is active
  useEffect(() => {
    if (activeTab === "devices") {
      fetchTrackingData();
    }
  }, [activeTab, fetchTrackingData]);

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
    setSelectedDevice, setMode, companies, updateTrackingObject, deleteTrackingObject,
    adminState.loadDevicesAndTracking // Pass the loadDevicesAndTracking function
  );
  
  const currentUser = getCurrentUser();
  const isMaster = isMasterAdmin();

  // We'll move the filtering logic to the SensorsTab component

  useEffect(() => {
    // If the tab was set to folders, change it to companies
    // Using as AdminTab to ensure type safety
    if (activeTab === "folders" as any) {
      handleTabChange(isMaster ? 'companies' : 'sensors');
    }
    
    // If user is not a master admin and tries to access companies tab, redirect to sensors tab
    if (!isMaster && activeTab === 'companies') {
      handleTabChange('sensors');
    }
  }, [activeTab, handleTabChange, isMaster]);

  if (!currentUser) {
    return <div>Not authenticated</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <AdminHeader />
      <Toaster position="top-right" />

      <div className="container mx-auto p-2 sm:p-4 pb-20">
        <SectionContainer>
          <SectionTitle className="text-lg sm:text-xl md:text-2xl">Admin Controls</SectionTitle>
          <p className="text-sm sm:text-base">Manage your system's data and settings.</p>
        </SectionContainer>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="mb-2 sm:mb-4 h-16 overflow-x-auto flex-wrap p-2">
            {isMaster && (
              <TabsTrigger value="companies" className="h-12 px-4">
                <span className="flex flex-col items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  <span className="text-[10px]">Company</span>
                </span>
              </TabsTrigger>
            )}
            <TabsTrigger value="users" className="h-12 px-4">
              <span className="flex flex-col items-center gap-1">
                <Users className="w-4 h-4" />
                <span className="text-[10px]">Users</span>
              </span>
            </TabsTrigger>
            <TabsTrigger value="sensors" className="h-12 px-4">
              <span className="flex flex-col items-center gap-1">
                <Database className="w-4 h-4" />
                <span className="text-[10px]">Sensors</span>
              </span>
            </TabsTrigger>
            <TabsTrigger value="devices" className="h-12 px-4">
              <span className="flex flex-col items-center gap-1">
                <Radar className="w-4 h-4" />
                <span className="text-[10px]">Track</span>
              </span>
            </TabsTrigger>
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
              currentUser={currentUser}
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
              currentUser={currentUser}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
