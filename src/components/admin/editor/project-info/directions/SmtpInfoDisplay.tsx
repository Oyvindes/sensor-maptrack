
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Info } from "lucide-react";
import { getEmailConfigInfo } from "@/services/email/emailService";

interface SmtpInfoDisplayProps {
  className?: string;
}

const SmtpInfoDisplay: React.FC<SmtpInfoDisplayProps> = ({ className }) => {
  const [showSmtpInfo, setShowSmtpInfo] = useState(false);
  const smtpConfig = getEmailConfigInfo();

  const toggleSmtpInfo = () => {
    setShowSmtpInfo(!showSmtpInfo);
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
          onClick={toggleSmtpInfo}
        >
          <Info className="h-3 w-3" />
          {showSmtpInfo ? "Hide Details" : "Show Details"}
        </Button>
        
        {showSmtpInfo && (
          <div className="mt-2 text-xs p-2 bg-background/80 rounded border">
            <p>Click the "Open Directions" button to view this location in Google Maps.</p>
            <p className="mt-1 italic">This will open in a new browser tab.</p>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default SmtpInfoDisplay;
