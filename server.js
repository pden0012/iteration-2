const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS配置 - 允许所有来源
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// 处理预检请求
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.status(200).end();
});

// 解析请求
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 文件上传配置
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'), false);
    }
  }
});

const BACKEND_URL = 'http://13.236.162.216:8080';

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'CORS Proxy Server',
    cors: 'Enabled',
    backend: BACKEND_URL
  });
});

// 地图数据代理
app.get('/api/map/*', async (req, res) => {
  try {
    const path = req.params[0];
    const queryString = req.url.split('?')[1] || '';
    const url = `${BACKEND_URL}/map/${path}${queryString ? '?' + queryString : ''}`;
    
    console.log(`🗺️ Map request from ${req.get('Origin')}: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CORS-Proxy-Server/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ Map data: ${data.data ? data.data.length : 0} items`);
    
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.json(data);
    
  } catch (error) {
    console.error('❌ Map proxy error:', error.message);
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.status(500).json({
      error: 'Map data fetch failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 图片分析代理
app.post('/api/ai/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
      return res.status(400).json({
        error: 'No image file provided'
      });
    }
    
    console.log(`🖼️ Image analysis from ${req.get('Origin')}: ${req.file.originalname}`);
    
    const FormData = require('form-data');
    const formData = new FormData();
    
    formData.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });
    formData.append('text', req.body.text || ' ');
    
    const response = await fetch(`${BACKEND_URL}/ai/image`, {
      method: 'POST',
      body: formData,
      headers: {
        ...formData.getHeaders(),
        'User-Agent': 'CORS-Proxy-Server/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ Image analysis completed`);
    
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.json(data);
    
  } catch (error) {
    console.error('❌ Image proxy error:', error.message);
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.status(500).json({
      error: 'Image analysis failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 通用代理
app.all('/api/*', async (req, res) => {
  try {
    const path = req.params[0];
    const queryString = req.url.split('?')[1] || '';
    const url = `${BACKEND_URL}/${path}${queryString ? '?' + queryString : ''}`;
    
    console.log(`🔄 ${req.method} request from ${req.get('Origin')}: ${url}`);
    
    const options = {
      method: req.method,
      headers: {
        'Content-Type': req.get('Content-Type') || 'application/json',
        'User-Agent': 'CORS-Proxy-Server/1.0'
      }
    };
    
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      options.body = JSON.stringify(req.body);
    }
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }
    
    const data = await response.json();
    
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.json(data);
    
  } catch (error) {
    console.error('❌ Generic proxy error:', error.message);
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.status(500).json({
      error: 'Proxy request failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 错误处理
app.use((error, req, res, next) => {
  console.error('🚨 Server error:', error);
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.status(500).json({
    error: 'Internal server error',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

// 404处理
app.use('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 CORS Proxy Server running on port ${PORT}`);
  console.log(`🌐 Health: http://localhost:${PORT}/health`);
  console.log(`🗺️ Map API: http://localhost:${PORT}/api/map/*`);
  console.log(`🖼️ Image API: http://localhost:${PORT}/api/ai/image`);
});

module.exports = app;
