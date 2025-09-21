const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const path = require('path');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Proxy for image detection API (must be before static files)
app.use('/api/ai/image', createProxyMiddleware({
  target: 'http://13.236.162.216:8080',
  changeOrigin: true,
  pathRewrite: {
    '^/api/ai/image': '/ai/image'
  },
  onError: (err, req, res) => {
    console.error('Image proxy error:', err);
    res.status(500).json({ error: 'Image proxy server error' });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log('Proxying image request to:', proxyReq.path);
  }
}));

// Proxy for map API (must be before static files)
app.use('/api/map', createProxyMiddleware({
  target: 'http://13.236.162.216:8080',
  changeOrigin: true,
  pathRewrite: {
    '^/api/map': '/map'
  },
  onError: (err, req, res) => {
    console.error('Map proxy error:', err);
    res.status(500).json({ error: 'Map proxy server error' });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log('Proxying map request to:', proxyReq.path);
  }
}));

// Serve static files from dist directory (after API routes)
app.use(express.static(path.join(__dirname, 'dist')));

// Handle all other routes by serving the Vue app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Express proxy server running on port ${PORT}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'dist')}`);
  console.log(`🔄 Proxying /api/ai/image to: http://13.236.162.216:8080/ai/image`);
  console.log(`🔄 Proxying /api/map to: http://13.236.162.216:8080/map`);
});
