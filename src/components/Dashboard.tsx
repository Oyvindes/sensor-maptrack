
import React from "react";
import { PageContainer, ContentContainer } from "./Layout";
import { useDashboardData } from "@/hooks/useDashboardData";
import DashboardHeader from "./dashboard/DashboardHeader";
import TrackingSection from "./dashboard/TrackingSection";
import SensorSection from "./dashboard/SensorSection";

const Dashboard: React.FC = () => {
  const {
    sensors,
    trackingObjects,
    isLoading,
    handleSensorClick,
    handleObjectSelect,
    handleRefresh
  } = useDashboardData();

  return (
    <PageContainer>
      <DashboardHeader onRefresh={handleRefresh} />

      <ContentContainer>
        <TrackingSection 
          trackingObjects={trackingObjects} 
          onObjectSelect={handleObjectSelect} 
        />
        
        <SensorSection 
          sensors={sensors} 
          isLoading={isLoading} 
          onSensorClick={handleSensorClick} 
        />
      </ContentContainer>
    </PageContainer>
  );
};

export default Dashboard;
