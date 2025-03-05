
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Plus, Settings } from "lucide-react";
import { getCurrentUser } from "@/services/authService";
import { Link } from "react-router-dom";

interface DashboardHeaderProps {
  onRefresh: () => void;
  onAddNewProject?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  onRefresh,
  onAddNewProject
}) => {
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "master";
  
  return (
    <div className="sticky top-0 z-10 w-full backdrop-blur-md bg-background/80">
      <div className="container py-3 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {currentUser?.name || 'User'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onAddNewProject && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onAddNewProject}
            >
              <Plus className="w-4 h-4 mr-1" /> Add Project
            </Button>
          )}
          {isAdmin && (
            <Button 
              variant="outline" 
              size="sm"
              asChild
            >
              <Link to="/admin">
                <Settings className="w-4 h-4 mr-1" /> Admin
              </Link>
            </Button>
          )}
          <Button 
            variant="outline" 
            size="icon"
            onClick={onRefresh}
          >
            <RefreshCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
