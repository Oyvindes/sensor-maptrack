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
      <div className="container py-2 sm:py-3 px-2 sm:px-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
        <div className="flex flex-col">
          <h1 className="text-lg sm:text-xl font-semibold">Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Welcome back, {currentUser?.name || 'User'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 self-end sm:self-auto">
          <ThemeToggle />
          <PdfSettingsButton />
          {onAddNewProject && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddNewProject}
              className="h-7 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden xs:inline">Add Project</span>
              <span className="xs:hidden">Add</span>
            </Button>
          )}
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-7 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
            >
              <Link to="/admin">
                <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-0 sm:mr-1" />
                <span className="hidden xs:inline">Admin</span>
              </Link>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="h-7 sm:h-9 text-xs sm:text-sm px-2 sm:px-3 gap-1"
          >
            <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Logout</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            className="h-7 w-7 sm:h-9 sm:w-9"
          >
            <RefreshCcw className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
