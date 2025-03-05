
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Navigation, Mail } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from "@/components/ui/dialog";

import DirectionsEmailForm from "./DirectionsEmailForm";
import SmtpInfoDisplay from "./SmtpInfoDisplay";
import { useDirectionsEmail, DirectionsEmailData } from "./useDirectionsEmail";

interface DirectionsDialogProps {
  address: string | undefined;
  location: string | { lat: number; lng: number } | undefined;
}

const DirectionsDialog: React.FC<DirectionsDialogProps> = ({ address, location }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const {
    emailAddress,
    setEmailAddress,
    isSendingDirections,
    emailError,
    setEmailError,
    sendDirectionsEmail,
    sendToOwner,
    openDirectionsInNewTab
  } = useDirectionsEmail({ address, location });

  const handleEmailChange = (email: string) => {
    setEmailAddress(email);
    if (emailError) setEmailError(null);
  };

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEmailError(null);
    }

    if (window) {
      const event = new CustomEvent('directionsDialogStateChange', { 
        detail: { isOpen: open } 
      });
      window.dispatchEvent(event);
    }
  };

  const handleSendEmail = async () => {
    const success = await sendDirectionsEmail();
    if (success) {
      setDialogOpen(false);
    }
  };

  const handleSendToOwner = async () => {
    const success = await sendToOwner();
    if (success) {
      setDialogOpen(false);
    }
  };

  if (!address) return null;

  return (
    <div className="mt-2 flex gap-2">
      <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
        <DialogTrigger asChild>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            className="gap-2"
          >
            <Navigation className="h-4 w-4" />
            <span>Send Directions</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md fixed z-[100] bg-background">
          <DialogHeader>
            <DialogTitle>Send Directions</DialogTitle>
            <DialogDescription>
              Send Google Maps directions to the project location
            </DialogDescription>
          </DialogHeader>
          
          <DirectionsEmailForm
            projectAddress={address}
            emailAddress={emailAddress}
            onEmailChange={handleEmailChange}
            emailError={emailError}
            isSendingDirections={isSendingDirections}
            onOpenDirections={openDirectionsInNewTab}
          />
          
          <SmtpInfoDisplay className="mt-4" />
          
          <DialogFooter className="flex sm:justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleSendToOwner}
              disabled={isSendingDirections}
              className="gap-2 hidden sm:flex"
            >
              <Mail className="h-4 w-4" />
              <span>Send to Project Owner</span>
            </Button>
            <Button 
              type="button" 
              onClick={handleSendEmail}
              disabled={isSendingDirections || !emailAddress}
              className="gap-2"
            >
              <Navigation className="h-4 w-4" />
              <span>{isSendingDirections ? "Sending..." : "Send Directions"}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DirectionsDialog;
