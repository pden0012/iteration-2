#!/usr/bin/env node

// Simple proxy test script for debugging Render deployment
// 简单的代理测试脚本，用于调试Render部署

const http = require('http');

const testUrl = 'http://3.106.197.188:8080/map/tree';
const options = {
  hostname: '3.106.197.188',
  port: 8080,
  path: '/map/tree',
  method: 'GET',
  timeout: 10000
};

console.log('🔍 Testing backend API connectivity...');
console.log(`📡 Target: ${testUrl}`);

const request = http.request(options, (response) => {
  console.log(`✅ Backend response: ${response.statusCode} ${response.statusMessage}`);
  console.log(`📊 Headers:`, response.headers);
  
  let data = '';
  response.on('data', (chunk) => {
    data += chunk;
  });
  
  response.on('end', () => {
    console.log(`📝 Response length: ${data.length} bytes`);
    if (data.length > 0) {
      try {
        const json = JSON.parse(data);
        console.log(`📋 Response preview:`, JSON.stringify(json).substring(0, 200) + '...');
      } catch (e) {
        console.log(`📋 Raw response:`, data.substring(0, 200) + '...');
      }
    }
  });
});

request.on('error', (error) => {
  console.error('❌ Backend connection error:', error.message);
  console.error('🔍 Error details:', {
    code: error.code,
    syscall: error.syscall,
    address: error.address,
    port: error.port
  });
});

request.on('timeout', () => {
  console.error('⏱️ Backend connection timeout');
  request.destroy();
});

request.setTimeout(10000);
request.end();
