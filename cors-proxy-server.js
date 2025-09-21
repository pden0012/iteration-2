const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://iteration-2.onrender.com',
      'https://iteration-2-underdeployment.onrender.com', // 添加实际的部署域名
      'http://localhost:3000',
      'http://localhost:5173' // Vite dev server
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('🚫 CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Backend API base URL
const BACKEND_URL = 'http://13.236.162.216:8080';

// Handle preflight requests
app.options('*', (req, res) => {
  console.log('🔄 Handling preflight request for:', req.path);
  res.status(200).end();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'CORS Proxy Server',
    cors: 'Enabled',
    allowedOrigins: [
      'https://iteration-2.onrender.com',
      'https://iteration-2-underdeployment.onrender.com', // 添加实际的部署域名
      'http://localhost:3000',
      'http://localhost:5173'
    ]
  });
});

// Proxy for map data (GET requests)
app.get('/api/map/*', async (req, res) => {
  try {
    const path = req.params[0];
    const queryString = req.url.split('?')[1] || '';
    const url = `${BACKEND_URL}/map/${path}${queryString ? '?' + queryString : ''}`;
    
    console.log(`🗺️ Proxying map request from origin: ${req.get('Origin')}`);
    console.log(`🗺️ Request URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CORS-Proxy-Server/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ Map data received, ${data.data ? data.data.length : 0} items`);
    res.json(data);
    
  } catch (error) {
    console.error('❌ Map proxy error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch map data',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Proxy for image analysis (POST requests with file upload)
app.post('/api/ai/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No image file provided',
        message: 'Please upload an image file'
      });
    }
    
    console.log(`🖼️ Proxying image analysis request`);
    console.log(`📁 File: ${req.file.originalname}, Size: ${req.file.size} bytes`);
    
    // Create FormData for the backend
    const FormData = require('form-data');
    const formData = new FormData();
    
    // Add the image file
    formData.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });
    
    // Add text parameter if provided
    const text = req.body.text || ' ';
    formData.append('text', text);
    
    // Forward to backend
    const response = await fetch(`${BACKEND_URL}/ai/image`, {
      method: 'POST',
      body: formData,
      headers: {
        ...formData.getHeaders(),
        'User-Agent': 'CORS-Proxy-Server/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
    
  } catch (error) {
    console.error('❌ Image analysis proxy error:', error.message);
    res.status(500).json({
      error: 'Failed to analyze image',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Generic proxy for other API endpoints
app.all('/api/*', async (req, res) => {
  try {
    const path = req.params[0];
    const queryString = req.url.split('?')[1] || '';
    const url = `${BACKEND_URL}/${path}${queryString ? '?' + queryString : ''}`;
    
    console.log(`🔄 Proxying ${req.method} request: ${url}`);
    
    const options = {
      method: req.method,
      headers: {
        'Content-Type': req.get('Content-Type') || 'application/json',
        'User-Agent': 'CORS-Proxy-Server/1.0'
      }
    };
    
    // Add body for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      options.body = JSON.stringify(req.body);
    }
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
    
  } catch (error) {
    console.error('❌ Generic proxy error:', error.message);
    res.status(500).json({
      error: 'Failed to proxy request',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('🚨 Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 CORS Proxy Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`🗺️ Map proxy: http://localhost:${PORT}/api/map/*`);
  console.log(`🖼️ Image proxy: http://localhost:${PORT}/api/ai/image`);
  console.log(`🔄 Generic proxy: http://localhost:${PORT}/api/*`);
});

module.exports = app;