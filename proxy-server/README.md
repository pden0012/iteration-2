# Hay Fever Management Proxy Server

This is a CORS proxy server that forwards API requests from the frontend to the backend server.

## Features

- ✅ CORS enabled for all frontend domains
- ✅ Proxies `/api/*` requests to backend
- ✅ Health check endpoint
- ✅ Error handling and logging
- ✅ Ready for deployment on Render

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

3. Server will run on `http://localhost:3001`

## Endpoints

- `GET /health` - Health check
- `GET /test` - Test endpoint
- `POST /api/ai/image` - Image detection (proxied to backend)
- `GET /api/map/tree` - Map data (proxied to backend)

## Deployment

This server is ready to be deployed on Render.com:

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the root directory to `proxy-server`
4. Use these settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Node Version: 18

## Environment Variables

- `PORT` - Server port (default: 3001)

## Backend Configuration

The server proxies requests to: `http://13.236.162.216:8080`

To change the backend URL, modify the `target` in the proxy middleware configuration.
