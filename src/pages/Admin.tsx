import { useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/services/authService";
import { Building2, Users, Radar, Database, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageContainer, ContentContainer } from "@/components/Layout";
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
  const { t } = useTranslation();
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
    <PageContainer>
      <AdminHeader />
      <Toaster position="top-right" />

      <ContentContainer className="pt-4 container">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-1">{t('admin.controls')}</h2>
          <p className="text-sm text-muted-foreground">{t('admin.manageSystemData')}</p>
        </div>
        <div className="sticky top-[60px] z-10 bg-background mb-6 shadow-sm">
          <div className="flex flex-wrap gap-1 sm:gap-0 sm:space-x-2 border-b px-2 sm:px-4 pt-1 sm:pt-2">
            {isMaster && (
              <Button
                variant="ghost"
                className={cn(
                  'rounded-none border-b-2 -mb-px px-2 sm:px-4 py-2 h-auto min-w-[64px]',
                  activeTab === 'companies'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
                onClick={() => handleTabChange('companies')}
              >
                <Building2 className="w-4 h-4 mr-2" />
                <span className="text-[10px] mt-1">{t('admin.company')}</span>
              </Button>
            )}
            <Button
              variant="ghost"
              className={cn(
                'rounded-none border-b-2 -mb-px px-2 sm:px-4 py-2 h-auto min-w-[64px]',
                activeTab === 'users'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
              onClick={() => handleTabChange('users')}
            >
              <Users className="w-4 h-4 mr-2" />
              <span className="text-[10px] mt-1">{t('admin.users')}</span>
            </Button>
            <Button
              variant="ghost"
              className={cn(
                'rounded-none border-b-2 -mb-px px-2 sm:px-4 py-2 h-auto min-w-[64px]',
                activeTab === 'sensors'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
              onClick={() => handleTabChange('sensors')}
            >
              <Database className="w-4 h-4 mr-2" />
              <span className="text-[10px] mt-1">{t('admin.sensors')}</span>
            </Button>
            <Button
              variant="ghost"
              className={cn(
                'rounded-none border-b-2 -mb-px px-2 sm:px-4 py-2 h-auto min-w-[64px]',
                activeTab === 'devices'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
              onClick={() => handleTabChange('devices')}
            >
              <Radar className="w-4 h-4 mr-2" />
              <span className="text-[10px] mt-1">{t('admin.track')}</span>
            </Button>
            <Button
              variant="ghost"
              className={cn(
                'rounded-none border-b-2 -mb-px px-2 sm:px-4 py-2 h-auto min-w-[64px]',
                'border-transparent text-muted-foreground hover:text-foreground'
              )}
              asChild
            >
              <Link to="/index">
                <Home className="w-4 h-4 mr-2" />
                <span className="text-[10px] mt-1">{t('admin.exitAdmin')}</span>
              </Link>
            </Button>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full block">
          
          <TabsContent value="companies" className="pt-4">
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

          <TabsContent value="users" className="pt-4">
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

          <TabsContent value="sensors" className="pt-4">
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

          <TabsContent value="devices" className="pt-4">
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
      </ContentContainer>
    </PageContainer>
  );
};

export default Admin;
