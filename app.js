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
});

// Create the main Express app
const app = express();
app.use(cors());

// Proxy requests to /api/notion to the Notion server
app.use('/api/notion', async (req, res) => {
  try {
    // Forward the request to the Notion server running on port 3001
    const proxyUrl = `http://localhost:3001${req.url}`;
    
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
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).send('Proxy error');
  }
});

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