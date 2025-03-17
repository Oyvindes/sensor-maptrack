import React from "react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Map, Radio, HelpCircle, ShoppingCart, Scan } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

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
    <div className="sticky top-[60px] z-10 bg-background mb-2 sm:mb-6 shadow-sm animate-fade-up [animation-delay:150ms]">
      <div className="flex flex-wrap gap-1 sm:gap-0 sm:space-x-2 border-b px-2 sm:px-4 py-1 sm:py-2 overflow-x-auto">
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
        
        {/* Sensor Health Check - Direct link to the page */}
        <Link to="/sensor-health-check" className="inline-flex">
          <Button
            variant="ghost"
            className={cn(
              "rounded-none border-b-2 -mb-px px-2 sm:px-4 py-1 sm:py-2 h-auto text-xs sm:text-sm",
              "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="flex items-center">
              <Scan className="w-4 h-4 mr-0 sm:mr-2" />
              <span className="hidden xs:inline">Sensor Health</span>
            </span>
          </Button>
        </Link>
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
        "rounded-none border-b-2 -mb-px px-2 sm:px-4 py-1 sm:py-2 h-auto text-xs sm:text-sm",
        isActive
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground"
      )}
      onClick={() => onViewChange(view)}
    >
      <span className="flex items-center">
        {icon}
        <span className="hidden xs:inline">{label}</span>
      </span>
    </Button>
  );
};

export default DashboardNavigation;
