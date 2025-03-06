
import { toast } from "sonner";

// This file has been refactored to remove actual email functionality
// It now serves as a compatibility layer for legacy code
// New implementations should use MQTT messaging for notifications
interface EmailData {
  to: string;
  subject: string;
  body: string;
  from?: string;
}

// Mock function that always returns success
// Real notifications should use the MQTT service instead
export const sendEmail = async (emailData?: EmailData): Promise<boolean> => {
  console.log("Email service called with:", emailData);
  console.log("This is a mock implementation - use MQTT for actual notifications");
  // Display a toast to show this was called
  toast.info("Email notification simulated - Check MQTT logs");
  return true;
};

// Configuration info for documentation purposes
export const getEmailConfigInfo = () => {
  return {
    status: "Deprecated", 
    message: "Email service is deprecated. Use MQTT for notifications.",
    legacyConfig: {
      host: "smtp.example.com",
      port: 587,
      secure: false,
      authUser: "Not configured - Using MQTT"
    }
  };
};
