import express from 'express';
import cors from 'cors';
import { Client } from '@notionhq/client';

const app = express();
const port = 3001;

// Enable CORS for all routes
app.use(cors());

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Initialize the Notion client with the API key from .env
const notion = new Client({
  auth: process.env.VITE_NOTION_TOKEN || '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',
});

console.log('Using Notion token:', process.env.VITE_NOTION_TOKEN ? 'From .env file' : 'Hardcoded fallback');

// Middleware to parse JSON bodies
app.use(express.json());

// Route to get a page by ID
app.get('/api/notion/page/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    
    // Get the page metadata
    const page = await notion.pages.retrieve({ page_id: pageId });
    
    // Get the page blocks (content)
    const blocks = await getPageBlocks(pageId);
    
    // Extract the title - handle different page response formats
    let title = 'Untitled';
    
    // For database items
    if ('properties' in page && page.properties) {
      // Find the title property (could be named differently)
      const titleProperty = Object.values(page.properties).find(
        (prop) => prop.type === 'title'
      );
      
      if (titleProperty && titleProperty.type === 'title' && titleProperty.title.length > 0) {
        title = titleProperty.title[0].plain_text;
      }
    }
    // For simple pages
    else if ('parent' in page) {
      // Try to extract from the first heading block
      const headingBlock = blocks.find(block => 
        block.type === 'heading_1' || 
        block.type === 'heading_2' || 
        block.type === 'heading_3'
      );
      
      if (headingBlock) {
        const headingText = headingBlock[headingBlock.type]?.rich_text?.[0]?.plain_text;
        if (headingText) {
          title = headingText;
        }
      }
    }
    
    res.json({
      id: pageId,
      title: title,
      blocks: blocks
    });
  } catch (error) {
    console.error('Error fetching Notion page:', error);
    res.status(500).json({ error: 'Failed to fetch Notion page' });
  }
});

// Helper function to get all blocks for a page
async function getPageBlocks(pageId) {
  try {
    let allBlocks = [];
    let hasMore = true;
    let startCursor = undefined;
    
    // Paginate through all blocks
    while (hasMore) {
      const response = await notion.blocks.children.list({
        block_id: pageId,
        start_cursor: startCursor,
      });
      
      allBlocks = [...allBlocks, ...response.results];
      hasMore = response.has_more;
      startCursor = response.next_cursor || undefined;
    }
    
    // Process nested blocks
    for (let i = 0; i < allBlocks.length; i++) {
      const block = allBlocks[i];
      
      // If the block has children, fetch them recursively
      if (block.has_children) {
        const childBlocks = await getPageBlocks(block.id);
        block.children = childBlocks;
      }
    }
    
    return allBlocks;
  } catch (error) {
    console.error('Error fetching Notion blocks:', error);
    throw new Error('Failed to fetch Notion blocks');
  }
}

// Start the server
const server = app.listen(port, () => {
  console.log(`Notion API proxy server running at http://localhost:${port}`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. The server may already be running.`);
  } else {
    console.error('Server error:', error);
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down Notion API proxy server...');
  server.close(() => {
    console.log('Notion API proxy server has been shut down.');
    process.exit(0);
  });
});