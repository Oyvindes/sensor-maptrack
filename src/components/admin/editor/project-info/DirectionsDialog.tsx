import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Navigation, Mail, ExternalLink, AlertTriangle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from "@/components/ui/dialog";

interface DirectionsDialogProps {
  address: string | undefined;
  location: string | { lat: number; lng: number } | undefined;
}

const DirectionsDialog: React.FC<DirectionsDialogProps> = ({
  address,
  location
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [isSendingDirections, setIsSendingDirections] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const getGoogleMapsUrl = () => {
    let googleMapsUrl = "";
    
    if (location) {
      try {
        let locationData: {lat: number, lng: number};
        if (typeof location === 'string') {
          locationData = JSON.parse(location);
        } else {
          locationData = location as {lat: number, lng: number};
        }
        
        if (locationData.lat && locationData.lng) {
          googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${locationData.lat},${locationData.lng}`;
          return googleMapsUrl;
        }
      } catch (e) {
        console.error("Error parsing location data:", e);
      }
    }
    
    if (address) {
      googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    }
    
    return googleMapsUrl;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const sendDirectionsEmail = async () => {
    if (!emailAddress || !address) {
      toast.error("Email address and project address are required");
      return;
    }

    if (!validateEmail(emailAddress)) {
      setEmailError("Please enter a valid email address");
      return;
    } else {
      setEmailError(null);
    }

    try {
      setIsSendingDirections(true);
      
      const googleMapsUrl = getGoogleMapsUrl();
      
      const emailSubject = "Directions to Project Location";
      const emailBody = `
        Hello,
        
        Here are the directions to the project location:
        
        Project Address: ${address}
        
        Google Maps Link: ${googleMapsUrl}
        
        You can click on the link above or copy and paste it into your browser to get directions.
        
        Thank you!
      `;
      
      const emailData = {
        to: emailAddress,
        subject: emailSubject,
        body: emailBody,
        from: "notifications@projectservice.com"
      };
      
      console.log("Sending email with data:", emailData);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (emailAddress.includes("error.com")) {
        throw new Error("Email server rejected the request");
      }
      
      if (emailAddress.includes("delay.com")) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      toast.success(`Directions sent to ${emailAddress}`);
      setDialogOpen(false);
    } catch (error) {
      console.error("Error sending directions:", error);
      toast.error("Failed to send directions: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsSendingDirections(false);
    }
  };

  const sendToOwner = () => {
    const ownerEmail = "project.owner@example.com";
    setEmailAddress(ownerEmail);
    sendDirectionsEmail();
  };
  
  const openDirectionsInNewTab = () => {
    const url = getGoogleMapsUrl();
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      toast.success("Directions opened in new tab");
    } else {
      toast.error("Could not generate directions URL");
    }
  };

  if (!address) return null;

  return (
    <div className="mt-2 flex gap-2">
      <Dialog open={dialogOpen} onOpenChange={(open) => {
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
      }}>
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
          
          <div className="space-y-4 py-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="projectAddress">Project Address</Label>
              <Input 
                id="projectAddress" 
                value={address || ""} 
                readOnly 
                className="bg-muted" 
              />
            </div>
            
            <div className="flex flex-col space-y-2">
              <Label htmlFor="emailAddress" className="flex justify-between">
                <span>Email Address</span>
                {isSendingDirections && <span className="text-sm text-muted-foreground">Sending...</span>}
              </Label>
              <Input 
                id="emailAddress" 
                type="email" 
                placeholder="Enter email address" 
                value={emailAddress} 
                onChange={(e) => {
                  setEmailAddress(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                className={emailError ? "border-red-500" : ""}
                disabled={isSendingDirections}
              />
              {emailError && (
                <div className="text-sm text-red-500 mt-1">{emailError}</div>
              )}
            </div>
            
            <Alert variant="default" className="bg-muted/50">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Information</AlertTitle>
              <AlertDescription>
                Enter any email to test the send function. Try these test addresses:
                <ul className="mt-2 list-disc pl-5 text-xs">
                  <li><code>test@error.com</code> - Simulates an email server error</li>
                  <li><code>test@delay.com</code> - Simulates a slow email server</li>
                </ul>
              </AlertDescription>
            </Alert>
            
            <Button
              type="button"
              variant="outline"
              onClick={openDirectionsInNewTab}
              className="w-full gap-2"
              disabled={isSendingDirections}
            >
              <ExternalLink className="h-4 w-4" />
              <span>Open Directions in New Tab</span>
            </Button>
          </div>
          
          <DialogFooter className="flex sm:justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={sendToOwner}
              disabled={isSendingDirections}
              className="gap-2 hidden sm:flex"
            >
              <Mail className="h-4 w-4" />
              <span>Send to Project Owner</span>
            </Button>
            <Button 
              type="button" 
              onClick={sendDirectionsEmail}
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
