const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'https://iteration-2-underdeployment.onrender.com',
    'https://iteration-2.onrender.com',
    'https://www.hayfree.space',
    'https://hayfree.space',
    'https://*.onrender.com' // 允许所有Render域名
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
    '^/api': '', // remove /api prefix
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
    // Add custom headers if needed
    proxyReq.setHeader('X-Forwarded-For', req.ip);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`✅ Backend responded with ${proxyRes.statusCode}`);
    // Add CORS headers to response
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With';
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

// Test endpoint to verify proxy is working
app.get('/test', (req, res) => {
  res.json({
    message: 'Proxy server is running!',
    timestamp: new Date().toISOString(),
    backend: 'http://13.236.162.216:8080'
  });
});

// Catch all handler
app.get('*', (req, res) => {
  res.json({
    message: 'Hay Fever Management Proxy Server',
    endpoints: {
      health: '/health',
      test: '/test',
      api: '/api/* (proxies to backend)'
    },
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on port ${PORT}`);
  console.log(`📡 Proxying API requests to: http://13.236.162.216:8080`);
  console.log(`🌐 CORS enabled for frontend domains`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});