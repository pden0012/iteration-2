#!/usr/bin/env node

// Render deployment diagnosis script
// Render部署诊断脚本

const http = require('http');

console.log('🔍 Render Deployment Diagnosis');
console.log('================================');

// Check environment variables
console.log('\n📋 Environment Variables:');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
console.log(`PORT: ${process.env.PORT || 'undefined'}`);
console.log(`VITE_API_BASE_URL: ${process.env.VITE_API_BASE_URL || 'undefined'}`);

// Test backend connectivity from Render environment
console.log('\n🌐 Testing Backend Connectivity...');

const options = {
  hostname: '3.106.197.188',
  port: 8080,
  path: '/map/tree',
  method: 'GET',
  timeout: 15000,
  headers: {
    'User-Agent': 'Render-Diagnosis/1.0',
    'Accept': 'application/json'
  }
};

const request = http.request(options, (response) => {
  console.log(`✅ Backend Response: ${response.statusCode} ${response.statusMessage}`);
  console.log(`📊 Headers:`, response.headers);
  
  let data = '';
  response.on('data', (chunk) => {
    data += chunk;
  });
  
  response.on('end', () => {
    console.log(`📝 Response Size: ${data.length} bytes`);
    if (response.statusCode === 200) {
      try {
        const json = JSON.parse(data);
        console.log(`🎯 Data Structure: code=${json.code}, data.length=${json.data?.length || 0}`);
        console.log(`✅ Backend API is working correctly!`);
      } catch (e) {
        console.log(`⚠️ Response is not valid JSON:`, data.substring(0, 200));
      }
    } else {
      console.log(`❌ Backend returned error:`, data.substring(0, 200));
    }
  });
});

request.on('error', (error) => {
  console.error('❌ Backend Connection Error:');
  console.error(`   Code: ${error.code}`);
  console.error(`   Message: ${error.message}`);
  console.error(`   Address: ${error.address}`);
  console.error(`   Port: ${error.port}`);
  
  if (error.code === 'ECONNREFUSED') {
    console.error('🔧 Diagnosis: Backend server is down or unreachable');
  } else if (error.code === 'ETIMEDOUT') {
    console.error('🔧 Diagnosis: Backend server response timeout');
  } else if (error.code === 'ENOTFOUND') {
    console.error('🔧 Diagnosis: DNS resolution failed');
  } else {
    console.error('🔧 Diagnosis: Unknown connection error');
  }
});

request.on('timeout', () => {
  console.error('⏱️ Backend Connection Timeout');
  request.destroy();
});

request.setTimeout(15000);
request.end();

// Test local server if running
setTimeout(() => {
  console.log('\n🏠 Testing Local Server (if running)...');
  
  const localOptions = {
    hostname: 'localhost',
    port: process.env.PORT || 3001,
    path: '/health',
    method: 'GET',
    timeout: 5000
  };
  
  const localRequest = http.request(localOptions, (response) => {
    console.log(`✅ Local Server Response: ${response.statusCode}`);
  });
  
  localRequest.on('error', (error) => {
    console.log(`ℹ️ Local server not running or not accessible`);
  });
  
  localRequest.setTimeout(5000);
  localRequest.end();
}, 1000);
