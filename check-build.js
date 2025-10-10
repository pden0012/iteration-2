#!/usr/bin/env node

/**
 * Build verification script for Render deployment
 * 构建验证脚本，用于Render部署
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking build status...');

// Check if dist directory exists
const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

console.log(`📁 Dist path: ${distPath}`);
console.log(`📄 Index path: ${indexPath}`);

if (fs.existsSync(distPath)) {
  console.log('✅ Dist directory exists');
  
  const files = fs.readdirSync(distPath);
  console.log(`📋 Files in dist:`, files);
  
  if (fs.existsSync(indexPath)) {
    console.log('✅ index.html exists');
    
    // Check file size
    const stats = fs.statSync(indexPath);
    console.log(`📊 index.html size: ${stats.size} bytes`);
    
    // Check if it contains Vue app content
    const content = fs.readFileSync(indexPath, 'utf8');
    if (content.includes('Hay Fever Management')) {
      console.log('✅ Vue app content detected in index.html');
    } else {
      console.log('⚠️ Vue app content not found in index.html');
      console.log('📝 Content preview:', content.substring(0, 200));
    }
    
    // Check for assets
    const assetsDir = path.join(distPath, 'assets');
    if (fs.existsSync(assetsDir)) {
      const assetFiles = fs.readdirSync(assetsDir);
      console.log(`📦 Assets found:`, assetFiles);
    } else {
      console.log('⚠️ Assets directory not found');
    }
    
  } else {
    console.log('❌ index.html not found');
  }
} else {
  console.log('❌ Dist directory not found');
  console.log('📋 Available directories:', fs.readdirSync(__dirname));
}

console.log('\n🔧 Build commands:');
console.log('npm install');
console.log('npm run build');
console.log('npm start');
