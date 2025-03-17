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
    <header className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        {currentUser && (
          <div className="flex items-center gap-2 ml-8 text-sm">
            <User className="h-4 w-4" />
            <span>
              {currentUser.name} 
              <span className="text-xs ml-1 text-muted-foreground">
                ({currentUser.role})
              </span>
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link to="/index">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
};

export default AdminHeader;
