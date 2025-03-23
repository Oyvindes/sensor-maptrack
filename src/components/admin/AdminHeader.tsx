import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LogOut, User, Home } from "lucide-react";
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
    <>
    <div className="fixed top-2 right-2 z-50 flex items-center gap-2">
      <ThemeToggle />
      <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
        className="rounded-full h-8 w-8 p-0 flex items-center justify-center"
        title="Logout"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
      <div className="sticky top-0 z-10 w-full backdrop-blur-md bg-background/80">
        <div className="container py-2 sm:py-3 px-2 sm:px-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
          <div className="flex items-center gap-3">
            <Link to="/index">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVMWkqNKdveNspJcP3FiCLMniKSRfrV-pMSQ&s"
                alt="Company Logo"
                className="h-16 max-w-[200px] rounded-md object-contain hover:opacity-90 transition-opacity cursor-pointer [-webkit-font-smoothing:antialiased]"
                style={{ aspectRatio: 'auto' }}
              />
            </Link>
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-xl font-semibold">Admin Dashboard</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Welcome back, {currentUser?.name || 'User'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Exit Admin button moved to tab navigation */}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminHeader;
