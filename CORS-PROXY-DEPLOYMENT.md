# CORS Proxy Server Deployment Guide

## Overview
This is a self-hosted CORS proxy server that solves the mixed content and CORS issues when accessing HTTP backend APIs from HTTPS frontend.

## Features
- ✅ CORS-enabled for HTTPS frontend
- ✅ File upload support for image analysis
- ✅ Map data proxy
- ✅ Error handling and logging
- ✅ Health check endpoint

## Deployment to Render.com

### Step 1: Create New Render Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository

### Step 2: Configure Service Settings
```
Name: hayfever-cors-proxy
Environment: Node
Build Command: npm install --production
Start Command: node cors-proxy-server.js
```

### Step 3: Environment Variables
No additional environment variables needed - the server uses default values.

### Step 4: Deploy
- Click "Create Web Service"
- Wait for deployment to complete
- Note the service URL (e.g., `https://hayfever-cors-proxy.onrender.com`)

## Local Development

### Prerequisites
- Node.js 16+
- npm

### Installation
```bash
# Install dependencies
npm install --production

# Start server
node cors-proxy-server.js
```

### Testing
```bash
# Health check
curl http://localhost:3001/health

# Test image upload
curl -X POST -F "image=@test.jpg" http://localhost:3001/api/ai/image

# Test map data
curl "http://localhost:3001/api/map/tree?zoom=12&bbox=-37.8,144.9,-37.7,145.0"
```

## API Endpoints

### Health Check
```
GET /health
```
Returns server status and timestamp.

### Map Data Proxy
```
GET /api/map/tree?zoom={zoom}&bbox={bbox}&allergenicity={filter}
```
Proxies map data requests to backend.

### Image Analysis Proxy
```
POST /api/ai/image
Content-Type: multipart/form-data
Body: image file + text parameter
```
Proxies image analysis requests to backend.

### Generic Proxy
```
ALL /api/*
```
Proxies any other API requests to backend.

## Configuration

### Backend URL
The server proxies requests to: `http://13.236.162.216:8080`

### CORS Origins
Allowed origins:
- `https://iteration-2.onrender.com` (production)
- `http://localhost:3000` (development)

### File Upload Limits
- Max file size: 2MB
- Allowed types: image/*

## Monitoring

### Logs
The server logs all requests and errors to console:
- 🗺️ Map requests
- 🖼️ Image analysis requests
- 🔄 Generic API requests
- ❌ Error messages

### Health Monitoring
Use the `/health` endpoint to monitor server status.

## Troubleshooting

### Common Issues

1. **Server won't start**
   - Check Node.js version (requires 16+)
   - Verify all dependencies are installed
   - Check port availability

2. **CORS errors**
   - Verify frontend domain is in allowed origins
   - Check if server is running on HTTPS in production

3. **File upload fails**
   - Check file size (max 2MB)
   - Verify file type is image/*
   - Check backend server availability

4. **Backend connection fails**
   - Verify backend URL is correct
   - Check network connectivity
   - Verify backend server is running

### Debug Mode
Set `NODE_ENV=development` for verbose logging.

## Security Considerations

- ✅ CORS is properly configured
- ✅ File upload validation
- ✅ Request size limits
- ✅ Error message sanitization
- ⚠️ No authentication (backend handles this)
- ⚠️ No rate limiting (consider adding for production)

## Performance

- Memory usage: ~50MB baseline
- CPU usage: Low (mostly I/O bound)
- Response time: Depends on backend latency
- Concurrent requests: Handled by Express.js

## Maintenance

### Updates
1. Update code in repository
2. Render will auto-deploy
3. Monitor logs for issues

### Scaling
- Render handles auto-scaling
- Consider upgrading plan for high traffic
- Monitor memory usage

## Support

For issues:
1. Check server logs
2. Test health endpoint
3. Verify backend connectivity
4. Check CORS configuration
