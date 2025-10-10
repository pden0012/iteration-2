#!/usr/bin/env node

/**
 * Script to get Render deployment IP information
 * 获取Render部署的IP信息
 */

const http = require('http');
const https = require('https');

console.log('🔍 Getting Render server IP information...\n');

// Get public IP from Render
function getPublicIP() {
  return new Promise((resolve, reject) => {
    https.get('https://api.ipify.org?format=json', (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result.ip);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Test backend connectivity
async function testBackendConnection() {
  const backendUrl = 'http://3.106.197.188:8080/map/tree?zoom=12&bbox=-37.882189,144.803112,-37.744947,145.123088';
  
  console.log('📡 Testing backend connection from current machine...');
  console.log(`   Target: ${backendUrl}\n`);
  
  return new Promise((resolve) => {
    const request = http.get(backendUrl, (res) => {
      console.log(`✅ Connection successful!`);
      console.log(`   HTTP Status: ${res.statusCode}`);
      console.log(`   Status Message: ${res.statusMessage}`);
      resolve(true);
    });
    
    request.on('error', (error) => {
      console.log(`❌ Connection failed!`);
      console.log(`   Error: ${error.message}`);
      console.log(`   Code: ${error.code}`);
      resolve(false);
    });
    
    request.setTimeout(10000, () => {
      console.log(`⏱️ Connection timeout!`);
      request.destroy();
      resolve(false);
    });
  });
}

async function main() {
  try {
    // Get current machine's public IP
    console.log('📍 Current machine public IP:');
    const myIP = await getPublicIP();
    console.log(`   ${myIP}\n`);
    
    // Test backend connection
    const canConnect = await testBackendConnection();
    
    console.log('\n' + '='.repeat(80));
    console.log('📋 BACKEND FIREWALL CONFIGURATION INSTRUCTIONS');
    console.log('='.repeat(80) + '\n');
    
    console.log('To allow Render to access your backend API server, follow these steps:\n');
    
    console.log('1️⃣  **Identify Backend Server Type**');
    console.log('   Your backend: http://3.106.197.188:8080');
    console.log('   This appears to be an AWS EC2 instance (IP in 3.106.x.x range)\n');
    
    console.log('2️⃣  **Get Render\'s IP Addresses**');
    console.log('   Render uses AWS infrastructure. You need to whitelist:');
    console.log('   - Render\'s static IP addresses (if using paid plan)');
    console.log('   - OR AWS IP ranges for Render\'s region\n');
    
    console.log('3️⃣  **AWS EC2 Security Group Configuration** (Most Common)');
    console.log('   a) Log in to AWS Console');
    console.log('   b) Go to EC2 > Security Groups');
    console.log('   c) Find the security group for 3.106.197.188');
    console.log('   d) Add Inbound Rule:');
    console.log('      - Type: Custom TCP');
    console.log('      - Port: 8080');
    console.log('      - Source: 0.0.0.0/0 (Allow all - for testing)');
    console.log('      - Description: Render deployment access\n');
    
    console.log('4️⃣  **For Production** (More Secure)');
    console.log('   Replace 0.0.0.0/0 with specific Render IP ranges:');
    console.log('   - Contact Render support for static IP addresses');
    console.log('   - OR use AWS CloudFront/API Gateway as intermediary\n');
    
    console.log('5️⃣  **Alternative: Make Backend API Public** (Temporary)');
    console.log('   If testing, temporarily allow all IPs:');
    console.log('   - Source: 0.0.0.0/0');
    console.log('   - Port: 8080');
    console.log('   - Protocol: TCP');
    console.log('   ⚠️  Remember to restrict this later!\n');
    
    console.log('6️⃣  **Verify Configuration**');
    console.log('   After updating firewall rules, test from Render:');
    console.log('   - Visit: https://iteration-2-hayfree.onrender.com/#map');
    console.log('   - Check if tree data loads successfully\n');
    
    console.log('='.repeat(80) + '\n');
    
    console.log('💡 Quick Commands for AWS CLI:\n');
    console.log('# Find security group for your EC2 instance');
    console.log('aws ec2 describe-instances --filters "Name=ip-address,Values=3.106.197.188"\n');
    
    console.log('# Add rule to allow port 8080 from anywhere (testing only)');
    console.log('aws ec2 authorize-security-group-ingress \\');
    console.log('  --group-id sg-XXXXXXXXX \\');
    console.log('  --protocol tcp \\');
    console.log('  --port 8080 \\');
    console.log('  --cidr 0.0.0.0/0\n');
    
    console.log('='.repeat(80) + '\n');
    
    console.log('📞 Need Help?');
    console.log('   - AWS Support: https://console.aws.amazon.com/support/');
    console.log('   - Render Support: https://render.com/docs');
    console.log('   - Backend Server Admin: Contact the person managing 3.106.197.188\n');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();

