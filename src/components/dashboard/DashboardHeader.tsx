
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RefreshCw, Settings } from "lucide-react";
import { PageHeader, PageTitle, PageSubtitle } from "@/components/Layout";
import { getCurrentUser } from "@/services/authService";

interface DashboardHeaderProps {
  onRefresh: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onRefresh }) => {
  const currentUser = getCurrentUser();

  return (
    <PageHeader>
      <div className="flex items-center justify-between">
        <div>
          <PageTitle>Sensor Monitoring & Tracking</PageTitle>
          <PageSubtitle>
            Real-time dashboard for sensor data and object tracking
          </PageSubtitle>
          {currentUser && (
            <div className="flex items-center gap-2 mt-2 text-sm">
              <span>Logged in as: {currentUser.name} ({currentUser.role})</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={onRefresh}
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="gap-2"
            asChild
          >
            <Link to="/admin">
              <Settings className="h-4 w-4" />
              <span>Admin</span>
            </Link>
          </Button>
        </div>
      </div>
    </PageHeader>
  );
};

export default DashboardHeader;
