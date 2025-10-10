// importing stuff we need for the proxy server
// basically this is like a middleman between frontend and backend
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

// create the express app
const app = express();
// use port 3001 normally but if we deploy somewhere like render they give us different port
const PORT = process.env.PORT || 3001;

// enable CORS for all routes - this is really important!
// without this browsers wont let our frontend talk to backend
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://www.hayfree.space',
    'https://iteration-2-underdeployment.onrender.com',
    'https://iteration2.onrender.com',
    'https://www.hayfree.space',
    'https://hayfree.space',
    'https://*.onrender.com', // allow all render domains
    'https://iteration-web.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// logging middleware - helps us see whats happening
// every request gets logged with timestamp
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();  // dont forget this or request hangs forever
});

// proxy api requests to backend - this is the main thing
// when frontend makes request to /api/something we forward it to real backend
app.use('/api', createProxyMiddleware({
  target: 'http://3.106.197.188:8080',  // where our backend lives
  changeOrigin: true,
  pathRewrite: {
    '^/api': '',  // remove /api prefix before sending to backend
  },
  // what to do when something goes wrong
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ 
      error: 'Proxy server error',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  },
  // before sending request to backend
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔄 Proxying ${req.method} ${req.url} to backend`);
    proxyReq.setHeader('X-Forwarded-For', req.ip);
  },
  // after getting response from backend
  onProxyRes: (proxyRes, req, res) => {
    console.log(`✅ Backend responded with ${proxyRes.statusCode}`);
    // add cors headers so browser doesnt block it
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With';
  }
}));

// health check endpoint - like asking "are you alive?"
// when we deploy to render they ping this to make sure server is running
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    proxy: 'Active'
  });
});

// test endpoint to check if proxy is working
app.get('/test', (req, res) => {
  res.json({
    message: 'Proxy server is running!',
    timestamp: new Date().toISOString(),
    backend: 'http://3.106.197.188:8080'
  });
});

// catch all handler - for any other requests
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

// start the server
app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on port ${PORT}`);
  console.log(`📡 Proxying API requests to: http://3.106.197.188:8080`);
  console.log(`🌐 CORS enabled for frontend domains`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
