import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Plus, Settings, LogOut } from "lucide-react";
import { getCurrentUser, logout } from "@/services/authService";
import { Link, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import PdfSettingsButton from "./PdfSettingsButton";
import { toast } from "sonner";
import { hasAdminAccess } from "@/utils/authUtils";

interface DashboardHeaderProps {
  onRefresh: () => void;
  onAddNewProject?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onRefresh,
  onAddNewProject
}) => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const isAdmin = hasAdminAccess();
  
  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        toast.success(result.message);
        navigate('/login');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('An error occurred during logout');
      console.error(error);
    }
  };
  
  return (
    <div className="sticky top-0 z-10 w-full backdrop-blur-md bg-background/80">
      <div className="container py-3 flex justify-between items-center">
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {currentUser?.name || 'User'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <PdfSettingsButton />
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
            size="sm"
            onClick={handleLogout}
            className="gap-1"
          >
            <LogOut className="w-4 h-4" /> Logout
          </Button>
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
