const express = require('express');
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

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle all other routes by serving the Vue app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Static file server running on port ${PORT}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'dist')}`);
  console.log(`ℹ️  Map data uses CORS proxy, image detection shows friendly message`);
});
