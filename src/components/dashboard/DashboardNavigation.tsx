import React from "react";
import { Button } from "@/components/ui/button";
import {
  LayoutGrid,
  FolderKanban,
  Radar,
  HelpCircle,
  Store,
  Stethoscope
} from "lucide-react";
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
      <div className="flex flex-wrap gap-1 sm:gap-0 sm:space-x-2 border-b px-2 sm:px-4 py-1 sm:py-2">
        <NavigationButton 
          view="dashboard"
          currentView={currentView}
          onViewChange={onViewChange}
          icon={<LayoutGrid className="w-4 h-4 mr-2" />}
          label="Overview"
        />
        <NavigationButton
          view="projects"
          currentView={currentView}
          onViewChange={onViewChange}
          icon={<FolderKanban className="w-4 h-4" />}
          label="Projects"
        />
        <NavigationButton
          view="tracking"
          currentView={currentView}
          onViewChange={onViewChange}
          icon={<Radar className="w-4 h-4" />}
          label="Track"
        />
        <NavigationButton
          view="help"
          currentView={currentView}
          onViewChange={onViewChange}
          icon={<HelpCircle className="w-4 h-4" />}
          label="Support"
        />
        <NavigationButton
          view="store"
          currentView={currentView}
          onViewChange={onViewChange}
          icon={<Store className="w-4 h-4" />}
          label="Shop"
        />
        
        {/* Sensor Health Check - Direct link to the page */}
        <div className="group relative">
          <Link to="/sensor-health-check" className="inline-flex">
            <Button
              variant="ghost"
              className={cn(
                "rounded-none border-b-2 -mb-px px-2 sm:px-4 py-2 h-auto min-w-[64px]",
                "border-transparent text-muted-foreground hover:text-foreground"
              )}
              aria-label="Sensor Health Check"
            >
              <Stethoscope className="w-4 h-4" />
              <span className="text-[10px] mt-1">Check</span>
            </Button>
          </Link>
          {/* Removed redundant tooltip */}
        </div>
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
    <div className="group relative">
      <Button
        variant="ghost"
        className={cn(
          "rounded-none border-b-2 -mb-px px-2 sm:px-4 py-2 h-auto min-w-[64px]",
          isActive
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
        onClick={() => onViewChange(view)}
        aria-label={label}
      >
        {icon}
        <span className="text-[10px] mt-1">{label}</span>
      </Button>
      {/* Removed redundant tooltip */}
    </div>
  );
};

export default DashboardNavigation;
