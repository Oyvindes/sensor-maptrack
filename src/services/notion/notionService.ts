
import { toast } from "sonner";

// Local mock content for the help section
const localHelpContent = {
  id: "c52622f3a3e243819ab0d9c42f58eeb4",
  title: "BRIKS Sensor Manual",
  blocks: [
    {
      id: "heading1",
      type: "heading_1",
      heading_1: {
        rich_text: [
          {
            plain_text: "Getting Started with BRIKS Sensors"
          }
        ]
      }
    },
    {
      id: "para1",
      type: "paragraph",
      paragraph: {
        rich_text: [
          {
            plain_text: "This guide will help you set up and use BRIKS sensors efficiently for your projects. BRIKS sensors are designed to provide accurate and reliable data for various construction and environmental monitoring needs."
          }
        ]
      }
    },
    {
      id: "heading2",
      type: "heading_2",
      heading_2: {
        rich_text: [
          {
            plain_text: "Setting Up Your Sensor"
          }
        ]
      }
    },
    {
      id: "para2",
      type: "paragraph",
      paragraph: {
        rich_text: [
          {
            plain_text: "Before deploying your sensor, ensure that it's properly configured and connected to the network. Follow these steps to get started:"
          }
        ]
      }
    },
    {
      id: "list1",
      type: "bulleted_list_item",
      bulleted_list_item: {
        rich_text: [
          {
            plain_text: "Charge the sensor fully before initial use"
          }
        ]
      }
    },
    {
      id: "list2",
      type: "bulleted_list_item",
      bulleted_list_item: {
        rich_text: [
          {
            plain_text: "Install the BRIKS mobile app from the App Store or Google Play"
          }
        ]
      }
    },
    {
      id: "list3",
      type: "bulleted_list_item",
      bulleted_list_item: {
        rich_text: [
          {
            plain_text: "Connect the sensor to your account using the QR code on the device"
          }
        ]
      }
    },
    {
      id: "heading3",
      type: "heading_2",
      heading_2: {
        rich_text: [
          {
            plain_text: "Deploying in the Field"
          }
        ]
      }
    },
    {
      id: "para3",
      type: "paragraph",
      paragraph: {
        rich_text: [
          {
            plain_text: "When deploying sensors at a construction site or monitoring location, consider the following best practices:"
          }
        ]
      }
    },
    {
      id: "num1",
      type: "numbered_list_item",
      numbered_list_item: {
        rich_text: [
          {
            plain_text: "Place sensors away from direct interference sources"
          }
        ]
      }
    },
    {
      id: "num2",
      type: "numbered_list_item",
      numbered_list_item: {
        rich_text: [
          {
            plain_text: "Ensure sensors have clear line-of-sight to the sky for GPS functionality"
          }
        ]
      }
    },
    {
      id: "num3",
      type: "numbered_list_item",
      numbered_list_item: {
        rich_text: [
          {
            plain_text: "Verify cellular connectivity in the deployment area"
          }
        ]
      }
    },
    {
      id: "heading4",
      type: "heading_2",
      heading_2: {
        rich_text: [
          {
            plain_text: "Maintenance & Troubleshooting"
          }
        ]
      }
    },
    {
      id: "para4",
      type: "paragraph",
      paragraph: {
        rich_text: [
          {
            plain_text: "Regular maintenance ensures your sensors operate reliably. Check battery levels weekly and clean sensors monthly to remove dust and debris. If you encounter any issues, the dashboard provides diagnostic information to help troubleshoot common problems."
          }
        ]
      }
    }
  ]
};

// Types for Notion API responses
interface NotionBlock {
  id: string;
  type: string;
  [key: string]: any;
}

interface NotionPage {
  id: string;
  title: string;
  blocks: NotionBlock[];
  children?: NotionPage[];
}

/**
 * Fetch content from Notion (now returns local content instead)
 */
export const fetchNotionContent = async (): Promise<NotionPage | null> => {
  try {
    // Return local mock content instead of fetching from Notion API
    // This avoids CORS issues in the browser environment
    return localHelpContent;
  } catch (error) {
    console.error("Error fetching help content:", error);
    toast.error("Failed to load help content");
    return null;
  }
};
