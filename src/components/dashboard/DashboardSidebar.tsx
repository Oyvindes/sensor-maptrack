
import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Folder, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";

interface DashboardSidebarProps {
  className?: string;
  activeView: 'dashboard' | 'projects';
  onViewChange: (view: 'dashboard' | 'projects') => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ 
  className, 
  activeView, 
  onViewChange 
}) => {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className={cn(
      "flex flex-col border-r border-border bg-background/80 backdrop-blur-md h-screen transition-all duration-300",
      collapsed ? "w-16" : "w-56",
      className
    )}>
      <div className="py-4 px-3 flex justify-between items-center">
        {!collapsed && <h2 className="font-semibold">Navigation</h2>}
        <Button 
          variant="ghost" 
          size="icon" 
          className="ml-auto" 
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className="flex flex-col gap-1 px-2">
        <Button 
          variant={activeView === 'dashboard' ? "default" : "ghost"}
          className={cn(
            "justify-start",
            collapsed ? "px-2" : "px-3"
          )}
          onClick={() => onViewChange('dashboard')}
        >
          <LayoutDashboard className="h-4 w-4 mr-2" />
          {!collapsed && <span>Dashboard</span>}
        </Button>
        
        <Button 
          variant={activeView === 'projects' ? "default" : "ghost"}
          className={cn(
            "justify-start",
            collapsed ? "px-2" : "px-3"
          )}
          onClick={() => onViewChange('projects')}
        >
          <Folder className="h-4 w-4 mr-2" />
          {!collapsed && <span>Projects</span>}
        </Button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
