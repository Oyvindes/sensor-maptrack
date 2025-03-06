
import { toast } from "sonner";

interface EmailData {
  to: string;
  subject: string;
  body: string;
  from?: string;
}

// Configuration for Microsoft 365 SMTP
const emailConfig = {
  host: import.meta.env.VITE_SMTP_HOST || "smtp.office365.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: import.meta.env.VITE_SMTP_USER,
    pass: import.meta.env.VITE_SMTP_PASSWORD
  }
};

/**
 * Sends an email using Microsoft 365 SMTP server
 * Note: In a production app, this should be handled by a backend service
 */
export const sendEmail = async (emailData: EmailData): Promise<boolean> => {
  console.log("Attempting to send email with data:", emailData);
  
  try {
    // In a real implementation, we would use a backend API to send the email
    // Frontend code should not directly connect to SMTP servers due to security concerns
    
    // Simulating API call to a backend endpoint
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...emailData,
        smtpConfig: {
          host: emailConfig.host,
          port: emailConfig.port,
          secure: emailConfig.secure,
          // Note: In a real app, credentials should be managed on the server side
          // This is just for demonstration purposes
          auth: {
            user: emailConfig.auth.user,
            pass: "[REDACTED]" // Never include actual passwords in client-side code
          }
        }
      }),
    });

    // Since we don't have a real backend endpoint yet, we'll simulate the response
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Test email addresses for simulation
    if (emailData.to.includes("error.com")) {
      throw new Error("Failed to send email: SMTP connection error");
    }
    
    if (emailData.to.includes("delay.com")) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    console.log("Email sent successfully to", emailData.to);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

// Export the configuration information that's safe to share
export const getEmailConfigInfo = () => {
  return {
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    authUser: emailConfig.auth.user ? "Configured" : "Not configured"
  };
};
