const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Image detection proxy endpoint
app.post('/api/ai/image', upload.single('image'), async (req, res) => {
  try {
    console.log('🔄 Processing image detection request...');
    
    if (!req.file) {
      return res.status(400).json({ 
        code: 0, 
        msg: 'No image file provided', 
        data: null 
      });
    }

    // Create FormData for backend request
    const FormData = require('form-data');
    const formData = new FormData();
    
    // Add image buffer to form data
    formData.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });
    formData.append('text', ' ');

    // Make request to backend API
    const backendUrl = 'http://13.236.162.216:8080/ai/image';
    console.log('📤 Sending request to backend:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    console.log('📥 Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend API error:', errorText);
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
    }

    // Get response text first to debug
    const responseText = await response.text();
    console.log('📄 Backend response text:', responseText.substring(0, 200) + '...');
    
    try {
      const result = JSON.parse(responseText);
      console.log('✅ Image detection successful');
      res.json(result);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.error('❌ Response text:', responseText);
      res.status(500).json({
        code: 0,
        msg: `Invalid JSON response from backend: ${parseError.message}`,
        data: null
      });
    }

  } catch (error) {
    console.error('❌ Image detection error:', error);
    res.status(500).json({
      code: 0,
      msg: `Image detection failed: ${error.message}`,
      data: null
    });
  }
});

// Handle all other routes by serving the Vue app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Image detection proxy server running on port ${PORT}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'dist')}`);
  console.log(`🔄 Image detection proxy: /api/ai/image → http://13.236.162.216:8080/ai/image`);
  console.log(`🗺️  Map data uses CORS proxy (allorigins.win)`);
});