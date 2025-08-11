// testing/basic-test.js - Basic connectivity test with ES modules

import { config } from 'dotenv';
import { readFileSync, existsSync } from 'fs';

// Load environment variables from .env files
config({ path: '../.env.local' });
config({ path: '../.env' });

async function testBasicConnectivity() {
  console.log('🧪 Testing basic connectivity...');
  
  // Test 1: Check if your website is accessible
  try {
    const response = await fetch('https://whatthemenu.com');
    console.log(`✅ Website accessible: ${response.status}`);
  } catch (error) {
    console.log(`❌ Website error: ${error.message}`);
  }
  
  // Test 2: Check environment variables
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY', 
    'VITE_GEMINI_API_KEY'
  ];
  
  console.log('\n🔧 Environment variables check:');
  requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    const exists = value ? '✅' : '❌';
    const preview = value ? `${value.substring(0, 20)}...` : 'Not found';
    console.log(`${exists} ${envVar}: ${preview}`);
  });
  
  // Test 3: Check your actual .env files
  console.log('\n📁 Environment files check:');
  const envFiles = ['.env.local', '.env', '.env.production'];
  
  envFiles.forEach(file => {
    try {
      const path = `../${file}`;
      const exists = existsSync(path);
      console.log(`${exists ? '✅' : '❌'} ${file}`);
      
      // Show first few lines if file exists
      if (exists) {
        const content = readFileSync(path, 'utf8');
        const lines = content.split('\n').slice(0, 3);
        console.log(`     Preview: ${lines[0].substring(0, 30)}...`);
      }
    } catch (error) {
      console.log(`❌ ${file}: Error checking`);
    }
  });
  
  console.log('\n✨ Basic test complete!');
}

// Run the test
testBasicConnectivity().catch(console.error);