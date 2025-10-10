#!/usr/bin/env node

/**
 * Build and Deploy Script for Hay Fever Management Website
 * This script ensures proper build process and deployment preparation
 * 
 * 花粉过敏管理网站构建和部署脚本
 * 此脚本确保正确的构建过程和部署准备
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting build and deployment process...');

// Check if we're in the right directory
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ package.json not found. Please run this script from the project root directory.');
  process.exit(1);
}

// Read package.json to check dependencies
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
console.log('📦 Package info:', {
  name: packageJson.name,
  version: packageJson.version,
  nodeVersion: packageJson.engines?.node || 'Not specified'
});

// Step 1: Install dependencies
console.log('\n📥 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit', cwd: __dirname });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Step 2: Build the project
console.log('\n🔨 Building the project...');
try {
  execSync('npm run build', { stdio: 'inherit', cwd: __dirname });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 3: Verify build output
console.log('\n🔍 Verifying build output...');
const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

if (!fs.existsSync(distPath)) {
  console.error('❌ dist directory not found after build');
  process.exit(1);
}

if (!fs.existsSync(indexPath)) {
  console.error('❌ index.html not found in dist directory');
  process.exit(1);
}

console.log('✅ Build verification passed');

// Step 4: Check static assets
const assetsPath = path.join(distPath, 'assets');
if (fs.existsSync(assetsPath)) {
  const assets = fs.readdirSync(assetsPath);
  console.log(`📁 Found ${assets.length} assets in dist/assets/`);
} else {
  console.log('⚠️ No assets directory found');
}

// Step 5: Check server.js
const serverPath = path.join(__dirname, 'server.js');
if (fs.existsSync(serverPath)) {
  console.log('✅ server.js found - ready for deployment');
} else {
  console.error('❌ server.js not found - required for deployment');
  process.exit(1);
}

// Step 6: Environment check
console.log('\n🌍 Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');
console.log('PORT:', process.env.PORT || 'Not set (will use default)');

// Check for required environment variables
const requiredEnvVars = ['VITE_GOOGLE_MAPS_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.log('\n⚠️ Missing environment variables:');
  missingEnvVars.forEach(envVar => {
    console.log(`  - ${envVar}`);
  });
  console.log('\n💡 These should be set in your deployment platform (e.g., Render.com)');
} else {
  console.log('✅ All required environment variables are set');
}

// Step 7: Deployment readiness
console.log('\n🎯 Deployment readiness check:');
console.log('✅ Dependencies installed');
console.log('✅ Project built successfully');
console.log('✅ Build output verified');
console.log('✅ Server file present');

console.log('\n🚀 Ready for deployment!');
console.log('\n📋 Next steps:');
console.log('1. Deploy to your hosting platform (e.g., Render.com)');
console.log('2. Set environment variables in your platform dashboard');
console.log('3. Ensure your platform runs "npm start" as the start command');
console.log('4. Monitor the logs for any issues');

console.log('\n🔗 Useful endpoints after deployment:');
console.log('- /health - Health check');
console.log('- /test - Test proxy server');
console.log('- /api/diagnose - Backend connectivity test');
console.log('- /api/health - API health check');

