# Digital Ocean Deployment Guide

This guide provides instructions for deploying the application to Digital Ocean and ensuring that the API endpoints work correctly.

## Prerequisites

- A Digital Ocean account
- A Digital Ocean Droplet or App Platform setup
- Basic knowledge of SSH and server configuration

## Deployment Steps

### 1. Set Up Environment Variables

Create a `.env.production` file based on the `.env.production.example` template:

```
# Production environment variables
VITE_API_BASE_URL=https://your-api-domain.com
VITE_NOTION_TOKEN=your_notion_token_here
```

Replace `https://your-api-domain.com` with the actual URL where your API server will be hosted. This could be:
- The same domain as your frontend but with a different port (e.g., `https://example.com:3001`)
- A subdomain dedicated to your API (e.g., `https://api.example.com`)
- A completely different domain

### 2. Build the Frontend

Build the frontend application:

```bash
npm run build
```

This will create a `dist` directory with the built application.

### 3. Deploy the API Server

The API server needs to be deployed separately from the frontend. There are several options:

#### Option A: Deploy on the Same Droplet

1. Copy the server files to your Droplet:
   ```bash
   scp -r server/* user@your-droplet-ip:/path/to/server
   ```

2. Install dependencies:
   ```bash
   ssh user@your-droplet-ip
   cd /path/to/server
   npm install
   ```

3. Set up a process manager like PM2 to keep the server running:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "api-server"
   pm2 save
   pm2 startup
   ```

#### Option B: Deploy as a Separate Service

1. Create a new Digital Ocean App or Droplet for the API server.
2. Deploy the server code to this new environment.
3. Ensure the server is accessible from the frontend domain (CORS configuration may be needed).

### 4. Configure CORS (if needed)

If your frontend and API are on different domains, you'll need to configure CORS in the server:

```javascript
// In server.js
import cors from 'cors';

// Enable CORS for specific origins
app.use(cors({
  origin: ['https://your-frontend-domain.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
```

### 5. Set Up Nginx (if using a Droplet)

If you're using a Digital Ocean Droplet, you'll likely need to set up Nginx as a reverse proxy:

```nginx
# /etc/nginx/sites-available/your-site
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/your-site /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Set Up SSL with Let's Encrypt

Secure your application with SSL:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Troubleshooting

### API Endpoints Return 404

If your API endpoints return 404 errors:

1. Check that the API server is running:
   ```bash
   pm2 list
   ```

2. Verify that the `VITE_API_BASE_URL` environment variable is set correctly.

3. Check Nginx configuration (if applicable) to ensure requests to `/api/*` are being properly proxied.

4. Check the server logs for errors:
   ```bash
   pm2 logs api-server
   ```

### CORS Errors

If you see CORS errors in the browser console:

1. Ensure your server's CORS configuration includes your frontend domain.
2. Check that the protocol (http vs https) matches in your CORS configuration.

### Node-RED Connection Issues

If you're having issues connecting to Node-RED:

1. Ensure Node-RED is running and accessible.
2. Check firewall settings to ensure the Node-RED port is open.
3. Update the Node-RED URL in `powerToggleHandler.js` if needed.