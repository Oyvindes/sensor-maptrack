import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { PageContainer, ContentContainer } from "@/components/Layout";
import { 
  getMockSensors, 
  getMockTrackingObjects, 
  sendCommandToSensor,
  updateTrackingObject
} from "@/services/sensorService";
import {
  getMockCompanies,
  getMockUsers,
  updateCompany,
  updateUser
} from "@/services/userService";
import { SensorData } from "@/components/SensorCard";
import { TrackingObject } from "@/components/TrackingMap";
import { Company, User } from "@/types/users";
import { ArrowLeft } from "lucide-react";
import SensorEditor from "@/components/SensorEditor";
import DeviceEditor from "@/components/DeviceEditor";
import AdminHeader from "@/components/admin/AdminHeader";
import ModeSwitcher from "@/components/admin/ModeSwitcher";
import SensorList from "@/components/admin/SensorList";
import DeviceList from "@/components/admin/DeviceList";
import CompanyList from "@/components/admin/CompanyList";
import CompanyEditor from "@/components/admin/CompanyEditor";
import UserList from "@/components/admin/UserList";
import UserEditor from "@/components/admin/UserEditor";

const Admin: React.FC = () => {
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [trackingObjects, setTrackingObjects] = useState<TrackingObject[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<TrackingObject | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentCompanyId, setCurrentCompanyId] = useState<string | undefined>(undefined);
  const [editMode, setEditMode] = useState<"sensors" | "devices" | "users">("sensors");
  const [userManagementView, setUserManagementView] = useState<"companies" | "users">("companies");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const sensorsData = getMockSensors();
        const objectsData = getMockTrackingObjects();
        const companiesData = getMockCompanies();
        const usersData = getMockUsers();
        
        setSensors(sensorsData);
        setTrackingObjects(objectsData);
        setCompanies(companiesData);
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleModeChange = (mode: "sensors" | "devices" | "users") => {
    setEditMode(mode);
    setSelectedSensor(null);
    setSelectedDevice(null);
    setSelectedCompany(null);
    setSelectedUser(null);
    setCurrentCompanyId(undefined);
    setUserManagementView("companies");
  };

  const handleSensorUpdate = async (updatedSensor: SensorData) => {
    try {
      await sendCommandToSensor(updatedSensor.id, "update", updatedSensor);
      
      if (updatedSensor.id.startsWith("sensor-")) {
        const newId = `${updatedSensor.type}-${Date.now().toString().slice(-3)}`;
        const savedSensor = { ...updatedSensor, id: newId };
        
        setSensors(prev => [...prev, savedSensor]);
        toast.success(`Sensor ${savedSensor.name} created successfully`);
      } else {
        setSensors(prev => 
          prev.map(sensor => 
            sensor.id === updatedSensor.id ? updatedSensor : sensor
          )
        );
        toast.success(`Sensor ${updatedSensor.name} updated successfully`);
      }
      
      setSelectedSensor(null);
    } catch (error) {
      toast.error("Failed to update sensor");
      console.error(error);
    }
  };

  const handleDeviceUpdate = async (updatedDevice: TrackingObject) => {
    try {
      await updateTrackingObject(updatedDevice.id, updatedDevice);
      
      if (updatedDevice.id.startsWith("device-")) {
        const newId = `vehicle-${Date.now().toString().slice(-3)}`;
        const savedDevice = { ...updatedDevice, id: newId };
        
        setTrackingObjects(prev => [...prev, savedDevice]);
        toast.success(`Device ${savedDevice.name} created successfully`);
      } else {
        setTrackingObjects(prev => 
          prev.map(device => 
            device.id === updatedDevice.id ? updatedDevice : device
          )
        );
        toast.success(`Device ${updatedDevice.name} updated successfully`);
      }
      
      setSelectedDevice(null);
    } catch (error) {
      toast.error("Failed to update device");
      console.error(error);
    }
  };

  const handleAddNewSensor = () => {
    const newSensor: SensorData = {
      id: `sensor-${Date.now()}`,
      name: "New Sensor",
      type: "temperature",
      value: 0,
      unit: "°C",
      status: "offline",
      lastUpdated: new Date().toLocaleTimeString()
    };
    
    setSelectedSensor(newSensor);
  };

  const handleAddNewDevice = () => {
    const newDevice: TrackingObject = {
      id: `device-${Date.now()}`,
      name: "New Device",
      position: { lat: 40.7128, lng: -74.006 },
      lastUpdated: new Date().toLocaleTimeString(),
      speed: 0,
      direction: 0,
      batteryLevel: 100
    };
    
    setSelectedDevice(newDevice);
  };

  const handleCompanyUpdate = async (updatedCompany: Company) => {
    try {
      await updateCompany(updatedCompany.id, updatedCompany);
      
      if (updatedCompany.id.startsWith("company-")) {
        const newId = `company-${Date.now().toString().slice(-3)}`;
        const savedCompany = { ...updatedCompany, id: newId };
        
        setCompanies(prev => [...prev, savedCompany]);
        toast.success(`Company ${savedCompany.name} created successfully`);
      } else {
        setCompanies(prev => 
          prev.map(company => 
            company.id === updatedCompany.id ? updatedCompany : company
          )
        );
        toast.success(`Company ${updatedCompany.name} updated successfully`);
      }
      
      setSelectedCompany(null);
    } catch (error) {
      toast.error("Failed to update company");
      console.error(error);
    }
  };

  const handleAddNewCompany = () => {
    const newCompany: Company = {
      id: `company-${Date.now()}`,
      name: "New Company",
      industry: "Technology",
      createdAt: new Date().toISOString().split('T')[0],
      status: "active"
    };
    
    setSelectedCompany(newCompany);
  };

  const handleViewCompanyUsers = (companyId: string) => {
    setCurrentCompanyId(companyId);
    setUserManagementView("users");
  };

  const handleUserUpdate = async (updatedUser: User) => {
    try {
      await updateUser(updatedUser.id, updatedUser);
      
      if (updatedUser.id.startsWith("user-")) {
        const newId = `user-${Date.now().toString().slice(-3)}`;
        const savedUser = { ...updatedUser, id: newId };
        
        setUsers(prev => [...prev, savedUser]);
        toast.success(`User ${savedUser.name} created successfully`);
      } else {
        setUsers(prev => 
          prev.map(user => 
            user.id === updatedUser.id ? updatedUser : user
          )
        );
        toast.success(`User ${updatedUser.name} updated successfully`);
      }
      
      setSelectedUser(null);
    } catch (error) {
      toast.error("Failed to update user");
      console.error(error);
    }
  };

  const handleAddNewUser = () => {
    const defaultCompanyId = currentCompanyId || (companies.length > 0 ? companies[0].id : "");
    
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: "New User",
      email: "user@example.com",
      role: "user",
      companyId: defaultCompanyId,
      lastLogin: new Date().toISOString(),
      status: "active"
    };
    
    setSelectedUser(newUser);
  };

  const handleBackToCompanies = () => {
    setUserManagementView("companies");
    setCurrentCompanyId(undefined);
  };

  return (
    <PageContainer>
      <AdminHeader />

      <ContentContainer>
        <ModeSwitcher 
          currentMode={editMode} 
          onModeChange={handleModeChange} 
        />

        {editMode === "sensors" ? (
          selectedSensor ? (
            <SensorEditor 
              sensor={selectedSensor} 
              onSave={handleSensorUpdate}
              onCancel={() => setSelectedSensor(null)}
            />
          ) : (
            <SensorList 
              sensors={sensors}
              onSensorSelect={setSelectedSensor}
              onAddNew={handleAddNewSensor}
            />
          )
        ) : editMode === "devices" ? (
          selectedDevice ? (
            <DeviceEditor 
              device={selectedDevice} 
              onSave={handleDeviceUpdate}
              onCancel={() => setSelectedDevice(null)}
            />
          ) : (
            <DeviceList 
              devices={trackingObjects}
              onDeviceSelect={setSelectedDevice}
              onAddNew={handleAddNewDevice}
            />
          )
        ) : (
          selectedCompany ? (
            <CompanyEditor
              company={selectedCompany}
              onSave={handleCompanyUpdate}
              onCancel={() => setSelectedCompany(null)}
            />
          ) : selectedUser ? (
            <UserEditor
              user={selectedUser}
              companies={companies}
              onSave={handleUserUpdate}
              onCancel={() => setSelectedUser(null)}
            />
          ) : userManagementView === "companies" ? (
            <CompanyList
              companies={companies}
              onCompanySelect={setSelectedCompany}
              onAddNew={handleAddNewCompany}
              onViewUsers={handleViewCompanyUsers}
            />
          ) : (
            <UserList
              users={users}
              companies={companies}
              currentCompanyId={currentCompanyId}
              onUserSelect={setSelectedUser}
              onAddNew={handleAddNewUser}
              onBack={handleBackToCompanies}
            />
          )
        )}
      </ContentContainer>
    </PageContainer>
  );
};

export default Admin;
