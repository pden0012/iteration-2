// CORS Proxy Server for Render deployment
// Super simple proxy to forward image detection requests

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fetch = require('node-fetch');
const FormData = require('form-data');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'CORS Proxy Server is running',
    endpoints: ['/api/image-detection']
  });
});

// Main proxy endpoint
app.post('/api/image-detection', upload.single('image'), async (req, res) => {
  try {
    console.log('Received image detection request');
    
    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    
    // Create FormData for backend request
    const form = new FormData();
    form.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });
    form.append('text', req.body.text || ' ');
    
    // Forward to your backend
    const backendUrl = 'http://13.236.162.216:8080/ai/image';
    console.log('Forwarding to backend:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });
    
    if (!response.ok) {
      console.error('Backend error:', response.status, response.statusText);
      return res.status(response.status).json({ 
        error: `Backend returned ${response.status}` 
      });
    }
    
    const data = await response.json();
    console.log('Backend response received:', data);
    
    res.json(data);
    
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Proxy server error', 
      message: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`CORS Proxy Server running on port ${port}`);
});
