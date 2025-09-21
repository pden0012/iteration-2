const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const path = require('path');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Proxy for image detection API
app.use('/api/ai/image', createProxyMiddleware({
  target: 'http://13.236.162.216:8080',
  changeOrigin: true,
  pathRewrite: {
    '^/api/ai/image': '/ai/image'
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy server error' });
  }
}));

// Proxy for map API
app.use('/api/map', createProxyMiddleware({
  target: 'http://13.236.162.216:8080',
  changeOrigin: true,
  pathRewrite: {
    '^/api/map': '/map'
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy server error' });
  }
}));

// Handle all other routes by serving the Vue app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
