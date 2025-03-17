import React from "react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Map, Radio, HelpCircle, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

type DashboardView = "dashboard" | "projects" | "tracking" | "help" | "store";

interface DashboardNavigationProps {
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
}

const DashboardNavigation: React.FC<DashboardNavigationProps> = ({
  currentView,
  onViewChange
}) => {
  return (
    <div className="sticky top-[60px] z-10 bg-background mb-6 shadow-sm animate-fade-up [animation-delay:150ms]">
      <div className="flex space-x-2 border-b px-4 py-2">
        <NavigationButton 
          view="dashboard"
          currentView={currentView}
          onViewChange={onViewChange}
          icon={<LayoutDashboard className="w-4 h-4 mr-2" />}
          label="Dashboard"
        />
        <NavigationButton 
          view="projects"
          currentView={currentView}
          onViewChange={onViewChange}
          icon={<Map className="w-4 h-4 mr-2" />}
          label="Projects"
        />
        <NavigationButton
          view="tracking"
          currentView={currentView}
          onViewChange={onViewChange}
          icon={<Radio className="w-4 h-4 mr-2" />}
          label="Asset Tracking"
        />
        <NavigationButton
          view="help"
          currentView={currentView}
          onViewChange={onViewChange}
          icon={<HelpCircle className="w-4 h-4 mr-2" />}
          label="Help"
        />
        <NavigationButton
          view="store"
          currentView={currentView}
          onViewChange={onViewChange}
          icon={<ShoppingCart className="w-4 h-4 mr-2" />}
          label="Store"
        />
      </div>
    </div>
  );
};

interface NavigationButtonProps {
  view: DashboardView;
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
  icon: React.ReactNode;
  label: string;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({
  view,
  currentView,
  onViewChange,
  icon,
  label
}) => {
  const isActive = currentView === view;
  
  return (
    <Button
      variant="ghost"
      className={cn(
        "rounded-none border-b-2 -mb-px px-4",
        isActive 
          ? "border-primary text-primary" 
          : "border-transparent text-muted-foreground hover:text-foreground"
      )}
      onClick={() => onViewChange(view)}
    >
      {icon}
      {label}
    </Button>
  );
};

export default DashboardNavigation;
