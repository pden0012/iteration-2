const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Log environment information for debugging
console.log('🚀 Starting server with configuration:');
console.log(`📡 PORT: ${PORT}`);
console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`🔗 Backend URL: http://3.106.197.188:8080`);

// Enable CORS for all routes
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://www.hayfree.space',
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

// Serve static files from dist directory (frontend build)
const staticPath = path.join(__dirname, 'dist');
console.log(`📁 Static files path: ${staticPath}`);

// Check if dist directory exists
const fs = require('fs');
if (fs.existsSync(staticPath)) {
  console.log(`✅ Dist directory exists, serving static files`);
  app.use(express.static(staticPath));
} else {
  console.error(`❌ Dist directory not found at: ${staticPath}`);
  console.log(`📋 Available directories:`, fs.readdirSync(__dirname));
}

// Proxy API requests to backend
app.use('/api', createProxyMiddleware({
  target: 'http://3.106.197.188:8080',
  changeOrigin: true,
  timeout: 90000, // 90 second timeout for large datasets (increased from 60s)
  proxyTimeout: 90000, // proxy timeout (increased from 60s)
  followRedirects: true,
  ws: false, // disable websocket proxy
  secure: false, // allow insecure connections to backend
  logLevel: 'debug', // enable detailed logging
  pathRewrite: {
    '^/api': '', // remove /api prefix
  },
  // Add connection retry options
  xfwd: true, // add x-forwarded headers
  headers: {
    'Connection': 'keep-alive',
    'Keep-Alive': 'timeout=90, max=1000'
  },
  onError: (err, req, res) => {
    console.error('🚨 Proxy error:', err.message);
    console.error('Error details:', {
      code: err.code,
      syscall: err.syscall,
      address: err.address,
      port: err.port,
      url: req.url,
      timestamp: new Date().toISOString()
    });
    
    // Check if response has already been sent
    if (res.headersSent) {
      console.log('⚠️ Response already sent, skipping error handler');
      return;
    }
    
    // Handle different types of proxy errors with specific status codes
    if (err.code === 'ECONNREFUSED') {
      console.error('🔌 Backend server connection refused - server may be down');
      res.status(502).json({ 
        error: 'Bad Gateway (502)',
        message: 'Cannot connect to backend API server. The server may be down or unreachable.',
        code: 'ECONNREFUSED',
        details: 'The proxy server cannot establish a connection to the backend API server at http://3.106.197.188:8080',
        timestamp: new Date().toISOString(),
        retryable: true
      });
    } else if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT') {
      console.error('⏱️ Backend server response timeout');
      res.status(504).json({ 
        error: 'Gateway Timeout (504)',
        message: 'Backend API server response timeout.',
        code: 'ETIMEDOUT',
        details: 'The request took too long to process. This may be due to large datasets or server load.',
        timestamp: new Date().toISOString(),
        retryable: true
      });
    } else if (err.code === 'ENOTFOUND') {
      console.error('🔍 Backend server hostname cannot be resolved');
      res.status(502).json({ 
        error: 'Bad Gateway (502)',
        message: 'Cannot resolve backend API server hostname.',
        code: 'ENOTFOUND',
        details: 'DNS resolution failed for the backend server hostname',
        timestamp: new Date().toISOString(),
        retryable: true
      });
    } else if (err.code === 'ECONNRESET') {
      console.error('🔄 Backend connection was reset');
      res.status(502).json({ 
        error: 'Bad Gateway (502)',
        message: 'Backend connection was reset.',
        code: 'ECONNRESET',
        details: 'The connection to the backend server was unexpectedly closed',
        timestamp: new Date().toISOString(),
        retryable: true
      });
    } else if (err.code === 'EPIPE') {
      console.error('📡 Backend connection pipe error');
      res.status(502).json({ 
        error: 'Bad Gateway (502)',
        message: 'Backend connection pipe error.',
        code: 'EPIPE',
        details: 'The connection to the backend server was broken',
        timestamp: new Date().toISOString(),
        retryable: true
      });
    } else {
      console.error('❓ Unknown proxy error:', err.code);
      res.status(502).json({ 
        error: 'Bad Gateway (502)',
        message: err.message,
        code: err.code,
        details: 'An unexpected error occurred while connecting to the backend server',
        timestamp: new Date().toISOString(),
        retryable: true
      });
    }
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔄 Proxying ${req.method} ${req.url} to backend`);
    console.log(`📡 Request headers:`, req.headers);
    console.log(`🌍 Client IP: ${req.ip}`);
    console.log(`🔗 User-Agent: ${req.get('User-Agent')}`);
    // Add custom headers if needed
    proxyReq.setHeader('X-Forwarded-For', req.ip);
    proxyReq.setHeader('X-Forwarded-Proto', req.protocol);
    proxyReq.setHeader('X-Forwarded-Host', req.get('Host'));
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`✅ Backend responded with ${proxyRes.statusCode} for ${req.url}`);
    
    // Log error responses for debugging
    if (proxyRes.statusCode >= 400) {
      console.error(`❌ Backend error response: ${proxyRes.statusCode} ${proxyRes.statusMessage}`);
    }
    
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
    backend: 'http://3.106.197.188:8080',
    port: PORT,
    nodeEnv: process.env.NODE_ENV
  });
});

// API health check endpoint (before proxy middleware)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    proxy: 'Active',
    backend: 'http://3.106.197.188:8080',
    port: PORT,
    nodeEnv: process.env.NODE_ENV,
    renderService: process.env.RENDER_SERVICE_ID ? 'Yes' : 'No',
    renderRegion: process.env.RENDER_REGION || 'Unknown'
  });
});

// Backend connectivity test endpoint
app.get('/api/test-backend', async (req, res) => {
  try {
    const response = await fetch('http://3.106.197.188:8080/dashboard?suburb=Melbourne&format=json', {
      timeout: 5000
    });
    
    res.json({
      status: 'Backend reachable',
      backendUrl: 'http://3.106.197.188:8080',
      responseStatus: response.status,
      responseOk: response.ok,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'Backend unreachable',
      backendUrl: 'http://3.106.197.188:8080',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Render-specific diagnostic endpoint
app.get('/api/diagnose', async (req, res) => {
  const diagnosis = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      RENDER_SERVICE_ID: process.env.RENDER_SERVICE_ID,
      RENDER_REGION: process.env.RENDER_REGION,
      RENDER_EXTERNAL_URL: process.env.RENDER_EXTERNAL_URL
    },
    backend: {
      target: 'http://3.106.197.188:8080',
      status: 'Testing...'
    }
  };
  
  // Test backend connectivity
  try {
    const http = require('http');
    const backendTest = await new Promise((resolve, reject) => {
      const options = {
        hostname: '3.106.197.188',
        port: 8080,
        path: '/map/tree',
        method: 'GET',
        timeout: 10000
      };
      
      const request = http.request(options, (response) => {
        resolve({
          status: response.statusCode,
          headers: response.headers,
          reachable: true
        });
      });
      
      request.on('error', (error) => {
        resolve({
          error: error.message,
          code: error.code,
          reachable: false
        });
      });
      
      request.setTimeout(10000, () => {
        resolve({
          error: 'Timeout',
          reachable: false
        });
      });
      
      request.end();
    });
    
    diagnosis.backend = backendTest;
  } catch (error) {
    diagnosis.backend = {
      error: error.message,
      reachable: false
    };
  }
  
  res.json(diagnosis);
});

// Catch all handler - serve index.html for Vue Router
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  console.log(`🎯 SPA route requested: ${req.url}, serving: ${indexPath}`);
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.error(`❌ Index.html not found at: ${indexPath}`);
    res.status(500).json({
      error: 'Frontend not built',
      message: 'The Vue application has not been built. Please run npm run build first.',
      availableFiles: fs.existsSync(staticPath) ? fs.readdirSync(staticPath) : 'dist directory not found'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Frontend + Proxy server running on port ${PORT}`);
  console.log(`📡 Proxying API requests to: http://3.106.197.188:8080`);
  console.log(`🌐 CORS enabled for frontend domains`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'dist')}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});