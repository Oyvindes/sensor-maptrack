import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Settings, LogOut } from "lucide-react";
import { getCurrentUser, logout } from "@/services/authService";
import { Link, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";
import { hasAdminAccess } from "@/utils/authUtils";

interface DashboardHeaderProps {
  onAddNewProject?: () => void;
  onViewChange?: (view: "dashboard" | "projects" | "tracking" | "help" | "store") => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onAddNewProject,
  onViewChange
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
    <>
      <div className="fixed top-2 right-2 z-50">
        <ThemeToggle />
      </div>
      <div className="sticky top-0 z-10 w-full backdrop-blur-md bg-background/80">
        <div className="container py-2 sm:py-3 px-2 sm:px-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
          <div className="flex items-center gap-3">
            <Link
              to="/index"
              onClick={() => onViewChange?.("dashboard")}
>
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVMWkqNKdveNspJcP3FiCLMniKSRfrV-pMSQ&s"
                alt="Company Logo"
                className="h-16 max-w-[200px] rounded-md object-contain hover:opacity-90 transition-opacity cursor-pointer [-webkit-font-smoothing:antialiased]"
                style={{ aspectRatio: 'auto' }}
              />
            </Link>
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-xl font-semibold">Dashboard</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Welcome back, {currentUser?.name || 'User'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 self-end sm:self-auto">
            {onAddNewProject && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAddNewProject}
                className="h-7 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
              >
                <Plus className="w-4 h-4" />
                <span className="text-[10px] mt-1">New</span>
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
                  <Settings className="w-4 h-4" />
                  <span className="text-[10px] mt-1">Admin</span>
                </Link>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="h-7 sm:h-9 text-xs sm:text-sm px-2 sm:px-3 gap-1"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-[10px] mt-1">Exit</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardHeader;
