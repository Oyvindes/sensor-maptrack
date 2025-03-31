import { getApiUrl } from '@/utils/apiUtils';

// We'll use the proxy server instead of directly calling the Notion API
// Base path for Notion API endpoints
const NOTION_API_PATH = '/api/notion';

export interface NotionBlock {
  id: string;
  type: string;
  [key: string]: any;
}

export interface NotionPage {
  id: string;
  title: string;
  blocks: NotionBlock[];
}

export const notionService = {
  /**
   * Fetches a Notion page by its ID
   * @param pageId The ID of the Notion page to fetch
   * @returns The page data
   */
  async getPage(pageId: string): Promise<NotionPage> {
    try {
      // Use our proxy server to fetch the page data
      const apiUrl = getApiUrl(`${NOTION_API_PATH}/page/${pageId}`);
      console.log(`Fetching Notion page from: ${apiUrl}`);
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data as NotionPage;
    } catch (error) {
      console.error('Error fetching Notion page:', error);
      throw new Error('Failed to fetch Notion page');
    }
  },

  /**
   * Extracts the page ID from a Notion URL
   * @param url The Notion page URL
   * @returns The page ID
   */
  extractPageId(url: string): string {
    // Extract the page ID from the URL
    // Example URL: https://briks.notion.site/Probe-Brukermanual-c52622f3a3e243819ab0d9c42f58eeb4
    const match = url.match(/([a-zA-Z0-9]{32})/);
    if (!match) {
      throw new Error('Invalid Notion URL');
    }
    return match[0];
  }
};