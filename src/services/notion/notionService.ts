
import { toast } from "sonner";

// Notion API constants
const NOTION_API_KEY = "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";
const NOTION_PAGE_ID = "c52622f3a3e243819ab0d9c42f58eeb4";
const NOTION_API_URL = "https://api.notion.com/v1";

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
 * Fetch content from Notion
 */
export const fetchNotionContent = async (): Promise<NotionPage | null> => {
  try {
    // First get the page
    const pageResponse = await fetch(`${NOTION_API_URL}/pages/${NOTION_PAGE_ID}`, {
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
      },
    });

    if (!pageResponse.ok) {
      throw new Error(`Failed to fetch Notion page: ${pageResponse.statusText}`);
    }

    const pageData = await pageResponse.json();
    
    // Then get the page blocks
    const blocksResponse = await fetch(`${NOTION_API_URL}/blocks/${NOTION_PAGE_ID}/children`, {
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
      },
    });

    if (!blocksResponse.ok) {
      throw new Error(`Failed to fetch Notion blocks: ${blocksResponse.statusText}`);
    }

    const blocksData = await blocksResponse.json();

    return {
      id: pageData.id,
      title: pageData.properties.title?.title[0]?.text?.content || "Sensor Manual",
      blocks: blocksData.results,
    };
  } catch (error) {
    console.error("Error fetching from Notion:", error);
    toast.error("Failed to load help content");
    return null;
  }
};
