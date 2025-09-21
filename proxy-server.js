const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3002;

// Enable CORS for all routes
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'https://iteration-2-underdeployment.onrender.com',
    'https://*.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Proxy API requests to backend
app.use('/api', createProxyMiddleware({
  target: 'http://13.236.162.216:8080',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '',
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ 
      error: 'Proxy server error',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔄 Proxying ${req.method} ${req.url} to backend`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`✅ Backend responded with ${proxyRes.statusCode}`);
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    proxy: 'Active'
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({
    message: 'Proxy server is running!',
    timestamp: new Date().toISOString(),
    backend: 'http://13.236.162.216:8080'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on port ${PORT}`);
  console.log(`📡 Proxying API requests to: http://13.236.162.216:8080`);
  console.log(`🌐 CORS enabled for frontend domains`);
});