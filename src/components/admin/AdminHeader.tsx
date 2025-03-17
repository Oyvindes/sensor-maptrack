import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LogOut, User, LayoutDashboard } from "lucide-react";
import { logout, getCurrentUser } from '@/services/authService';
import { toast } from 'sonner';
import { ThemeToggle } from "@/components/ThemeToggle";

const AdminHeader: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

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
    <header className="p-2 sm:p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 w-full sm:w-auto">
        <h1 className="text-xl sm:text-2xl font-bold">Admin Dashboard</h1>
        {currentUser && (
          <div className="flex items-center gap-1 sm:gap-2 sm:ml-4 md:ml-8 text-xs sm:text-sm mt-1 sm:mt-0">
            <User className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>
              {currentUser.name}
              <span className="text-[10px] sm:text-xs ml-1 text-muted-foreground">
                ({currentUser.role})
              </span>
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-auto">
        <ThemeToggle />
        <Button variant="ghost" size="sm" asChild className="h-8 w-8 sm:h-auto sm:w-auto sm:px-2 p-0 sm:gap-2">
          <Link to="/index">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </Button>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="h-8 w-8 sm:h-auto sm:w-auto sm:px-2 p-0 sm:gap-2">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
};

export default AdminHeader;
