
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Info } from "lucide-react";

interface SmtpInfoDisplayProps {
  className?: string;
}

const SmtpInfoDisplay: React.FC<SmtpInfoDisplayProps> = ({ className }) => {
  const [showInfo, setShowInfo] = useState(false);

  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  return (
    <Alert variant="default" className={`bg-muted/50 ${className}`}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        <p className="mb-2">Map directions are available for this location.</p>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          className="mt-1 text-xs gap-1"
          onClick={toggleInfo}
        >
          <Info className="h-3 w-3" />
          {showInfo ? "Hide Details" : "Show Details"}
        </Button>
        
        {showInfo && (
          <div className="mt-2 text-xs p-2 bg-background/80 rounded border">
            <p>Click the "Open Directions" button to view this location in Google Maps.</p>
            <p className="mt-1 italic">This will open in a new browser tab.</p>
            <p className="mt-1 text-blue-500">Notifications are handled via MQTT messaging.</p>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default SmtpInfoDisplay;
