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
        className="flex items-center gap-1"
        onClick={() => setOpen(true)}
      >
        <Settings className="h-4 w-4" />
        <span className="hidden sm:inline">PDF Settings</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md z-[9999]">
          <DialogHeader>
            <DialogTitle>PDF Report Settings</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Choose which data types to include by default when generating project reports:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="temperature" 
                  checked={selectedTypes.temperature}
                  onCheckedChange={() => handleToggleType('temperature')}
                />
                <Label htmlFor="temperature" className="flex items-center">
                  <span 
                    className="inline-block w-3 h-3 mr-2 rounded-full" 
                    style={{ backgroundColor: "#ff4444" }}
                  />
                  Temperature
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="humidity" 
                  checked={selectedTypes.humidity}
                  onCheckedChange={() => handleToggleType('humidity')}
                />
                <Label htmlFor="humidity" className="flex items-center">
                  <span 
                    className="inline-block w-3 h-3 mr-2 rounded-full" 
                    style={{ backgroundColor: "#4444ff" }}
                  />
                  Humidity
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="battery" 
                  checked={selectedTypes.battery}
                  onCheckedChange={() => handleToggleType('battery')}
                />
                <Label htmlFor="battery" className="flex items-center">
                  <span 
                    className="inline-block w-3 h-3 mr-2 rounded-full" 
                    style={{ backgroundColor: "#44ff44" }}
                  />
                  Battery
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="signal" 
                  checked={selectedTypes.signal}
                  onCheckedChange={() => handleToggleType('signal')}
                />
                <Label htmlFor="signal" className="flex items-center">
                  <span 
                    className="inline-block w-3 h-3 mr-2 rounded-full" 
                    style={{ backgroundColor: "#ff44ff" }}
                  />
                  Signal
                </Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSettings}>Save Preferences</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PdfSettingsButton;