
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Navigation, Mail, ExternalLink } from "lucide-react";
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
    
    // Fallback to address if location coordinates aren't available
    if (address) {
      googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    }
    
    return googleMapsUrl;
  };

  const sendDirectionsEmail = async () => {
    if (!emailAddress || !address) {
      toast.error("Email address and project address are required");
      return;
    }

    try {
      setIsSendingDirections(true);
      
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const googleMapsUrl = getGoogleMapsUrl();
      
      // In a real implementation, this would call an API endpoint to send the email
      console.log(`Sending directions for project to ${emailAddress}`);
      console.log(`Directions URL: ${googleMapsUrl}`);
      
      // Email content that would be sent
      const emailSubject = "Directions to Project Location";
      const emailBody = `
        Hello,
        
        Here are the directions to the project location:
        
        Project Address: ${address}
        
        Google Maps Link: ${googleMapsUrl}
        
        You can click on the link above or copy and paste it into your browser to get directions.
        
        Thank you!
      `;
      
      console.log("Email Subject:", emailSubject);
      console.log("Email Body:", emailBody);
      
      toast.success(`Directions sent to ${emailAddress}`);
      setDialogOpen(false);
    } catch (error) {
      console.error("Error sending directions:", error);
      toast.error("Failed to send directions");
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
        // Update SensorFolderEditor parent component about dialog state
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
              <Label htmlFor="emailAddress">Email Address</Label>
              <Input 
                id="emailAddress" 
                type="email" 
                placeholder="Enter email address" 
                value={emailAddress} 
                onChange={(e) => setEmailAddress(e.target.value)} 
              />
            </div>
            
            <Button
              type="button"
              variant="outline"
              onClick={openDirectionsInNewTab}
              className="w-full gap-2"
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
              <span>Send Directions</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DirectionsDialog;
