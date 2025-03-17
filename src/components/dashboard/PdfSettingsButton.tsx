import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useDashboardData } from "@/hooks/useDashboardData";
import { toast } from "sonner";

const PdfSettingsButton = () => {
  const [open, setOpen] = useState(false);
  const { setDefaultDataTypes } = useDashboardData();
  
  const [selectedTypes, setSelectedTypes] = useState({
    temperature: true,
    humidity: true,
    battery: true,
    signal: true
  });

  const handleToggleType = (type: keyof typeof selectedTypes) => {
    setSelectedTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleSaveSettings = () => {
    const dataTypes = Object.entries(selectedTypes)
      .filter(([_, isSelected]) => isSelected)
      .map(([type]) => type);
    
    setDefaultDataTypes(dataTypes);
    toast.success("PDF report preferences saved");
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1 h-7 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
        onClick={() => setOpen(true)}
      >
        <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
        <span className="hidden xs:inline">PDF Settings</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md z-[9999] p-3 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">PDF Report Settings</DialogTitle>
          </DialogHeader>
          
          <div className="py-2 sm:py-4">
            <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4">
              Choose which data types to include by default when generating project reports:
            </p>
            
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Checkbox
                  id="temperature"
                  checked={selectedTypes.temperature}
                  onCheckedChange={() => handleToggleType('temperature')}
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                />
                <Label htmlFor="temperature" className="flex items-center text-xs sm:text-sm">
                  <span
                    className="inline-block w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-2 rounded-full"
                    style={{ backgroundColor: "#ff4444" }}
                  />
                  Temperature
                </Label>
              </div>
              
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Checkbox
                  id="humidity"
                  checked={selectedTypes.humidity}
                  onCheckedChange={() => handleToggleType('humidity')}
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                />
                <Label htmlFor="humidity" className="flex items-center text-xs sm:text-sm">
                  <span
                    className="inline-block w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-2 rounded-full"
                    style={{ backgroundColor: "#4444ff" }}
                  />
                  Humidity
                </Label>
              </div>
              
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Checkbox
                  id="battery"
                  checked={selectedTypes.battery}
                  onCheckedChange={() => handleToggleType('battery')}
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                />
                <Label htmlFor="battery" className="flex items-center text-xs sm:text-sm">
                  <span
                    className="inline-block w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-2 rounded-full"
                    style={{ backgroundColor: "#44ff44" }}
                  />
                  Battery
                </Label>
              </div>
              
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Checkbox
                  id="signal"
                  checked={selectedTypes.signal}
                  onCheckedChange={() => handleToggleType('signal')}
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                />
                <Label htmlFor="signal" className="flex items-center text-xs sm:text-sm">
                  <span
                    className="inline-block w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-2 rounded-full"
                    style={{ backgroundColor: "#ff44ff" }}
                  />
                  Signal
                </Label>
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0 mt-2 sm:mt-0">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="h-8 sm:h-10 text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSettings}
              className="h-8 sm:h-10 text-xs sm:text-sm"
            >
              Save Preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PdfSettingsButton;