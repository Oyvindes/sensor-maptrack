
import { toast } from "sonner";

// This file has been simplified to remove email functionality
// Only maintaining the interface for backwards compatibility
interface EmailData {
  to: string;
  subject: string;
  body: string;
  from?: string;
}

// Simple mock function that always returns true
// Maintained for backwards compatibility
export const sendEmail = async (): Promise<boolean> => {
  return true;
};

// Simplified configuration info
export const getEmailConfigInfo = () => {
  return {
    host: "smtp.example.com",
    port: 587,
    secure: false,
    authUser: "Not configured"
  };
};
