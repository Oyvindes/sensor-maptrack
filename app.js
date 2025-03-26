import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import cors from 'cors';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Start the Notion proxy server as a child process
console.log('Starting Notion proxy server...');
const notionServer = spawn('node', ['server/server.js']);

notionServer.stdout.on('data', (data) => {
  console.log(`Notion server: ${data}`);
});

notionServer.stderr.on('data', (data) => {
  console.error(`Notion server error: ${data}`);
});

notionServer.on('close', (code) => {
  console.log(`Notion server process exited with code ${code}`);
  
  // If the Notion server fails to start, we'll handle requests directly
  if (code !== 0) {
    console.log('Will handle Notion API requests directly since the server failed to start');
  }
});

// Create the main Express app
const app = express();
app.use(cors());

// Proxy requests to /api/notion to the Notion server
app.use('/api/notion', async (req, res) => {
  try {
    // Extract the page ID from the URL if it's a page request
    const pageIdMatch = req.url.match(/\/page\/([^\/]+)/);
    const pageId = pageIdMatch ? pageIdMatch[1] : null;
    
    // Try to proxy to the local Notion server first
    try {
      const proxyUrl = `http://localhost:3001${req.url}`;
      console.log(`Proxying request to local Notion server: ${proxyUrl}`);
      
      // Get the request body if it exists
      let body = null;
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        body = Buffer.concat(chunks);
      }
      
      // Forward the request
      const response = await fetch(proxyUrl, {
        method: req.method,
        headers: req.headers,
        body: body,
      });
      
      // Copy status and headers
      res.status(response.status);
      for (const [key, value] of Object.entries(response.headers.raw())) {
        res.setHeader(key, value);
      }
      
      // Send the response body
      const responseBody = await response.text();
      res.send(responseBody);
    } catch (proxyError) {
      // If proxying fails and this is a page request, try to fetch directly from Notion API
      if (pageId) {
        console.log(`Proxy to local server failed, fetching directly from Notion API for page: ${pageId}`);
        
        // Initialize the Notion client with the API key from environment
        const { Client } = await import('@notionhq/client');
        const notion = new Client({
          auth: process.env.VITE_NOTION_TOKEN || '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',
        });
        
        // Get the page metadata
        const page = await notion.pages.retrieve({ page_id: pageId });
        
        // Get the page blocks (content)
        const blocks = await getPageBlocks(notion, pageId);
        
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
      } else {
        // For non-page requests or if direct fetch fails, return the original error
        throw proxyError;
      }
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).send(`API error: ${error.message}`);
  }
});

// Helper function to get all blocks for a page
async function getPageBlocks(notion, pageId) {
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
        const childBlocks = await getPageBlocks(notion, block.id);
        block.children = childBlocks;
      }
    }
    
    return allBlocks;
  } catch (error) {
    console.error('Error fetching Notion blocks:', error);
    throw new Error('Failed to fetch Notion blocks');
  }
}

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// For any other request, send the index.html file (for SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 8081; // Changed to 8081 to avoid conflict
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  notionServer.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  notionServer.kill();
  process.exit(0);
});