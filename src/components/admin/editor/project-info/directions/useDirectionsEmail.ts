
import { useState } from "react";
import { toast } from "sonner";
import { sendEmail } from "@/services/email/emailService";

export interface DirectionsEmailData {
  address: string | undefined;
  location: string | { lat: number; lng: number } | undefined;
}

export const useDirectionsEmail = ({ address, location }: DirectionsEmailData) => {
  const [emailAddress, setEmailAddress] = useState("");
  const [isSendingDirections, setIsSendingDirections] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

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
      
      const success = await sendEmail(emailData);
      
      if (success) {
        toast.success(`Directions sent to ${emailAddress}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error sending directions:", error);
      toast.error("Failed to send directions: " + (error instanceof Error ? error.message : "Unknown error"));
      return false;
    } finally {
      setIsSendingDirections(false);
    }
  };

  const sendToOwner = () => {
    const ownerEmail = "project.owner@example.com";
    setEmailAddress(ownerEmail);
    return sendDirectionsEmail();
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

  return {
    emailAddress,
    setEmailAddress,
    isSendingDirections,
    emailError,
    setEmailError,
    sendDirectionsEmail,
    sendToOwner,
    openDirectionsInNewTab
  };
};
