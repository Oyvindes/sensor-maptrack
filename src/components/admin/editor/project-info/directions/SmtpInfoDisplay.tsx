
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
        <p className="mb-2">Microsoft 365 SMTP is configured for sending emails.</p>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          className="mt-1 text-xs gap-1"
          onClick={toggleSmtpInfo}
        >
          <Info className="h-3 w-3" />
          {showSmtpInfo ? "Hide Configuration" : "Show Configuration"}
        </Button>
        
        {showSmtpInfo && (
          <div className="mt-2 text-xs p-2 bg-background/80 rounded border">
            <p><strong>SMTP Host:</strong> {smtpConfig.host}</p>
            <p><strong>SMTP Port:</strong> {smtpConfig.port}</p>
            <p><strong>Secure:</strong> {smtpConfig.secure ? "Yes" : "No"}</p>
            <p><strong>Auth User:</strong> {smtpConfig.authUser}</p>
            <p className="mt-1 italic">Note: To fully enable this feature, the SMTP credentials need to be configured.</p>
          </div>
        )}
        
        <div className="mt-2">
          Test addresses:
          <ul className="mt-1 list-disc pl-5 text-xs">
            <li><code>test@error.com</code> - Simulates an email server error</li>
            <li><code>test@delay.com</code> - Simulates a slow email server</li>
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default SmtpInfoDisplay;
