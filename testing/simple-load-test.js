// testing/simple-load-test.js - Simple load test with ES modules

async function testWebsiteLoad() {
  console.log('🚀 Testing website load performance...');
  
  const testUrls = [
    'https://whatthemenu.com',
    'https://whatthemenu.com/#pricing',
    'https://whatthemenu.com/contact'
  ];
  
  for (const url of testUrls) {
    const startTime = Date.now();
    
    try {
      const response = await fetch(url);
      const endTime = Date.now();
      const loadTime = endTime - startTime;
      
      console.log(`✅ ${url}`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Load time: ${loadTime}ms`);
      console.log(`   Content-Type: ${response.headers.get('content-type')}`);
      console.log('');
      
    } catch (error) {
      console.log(`❌ ${url}: ${error.message}`);
    }
  }
  
  console.log('✨ Website load test complete!');
}

async function simulateLoad() {
  console.log('🔥 Simulating concurrent users...');
  
  const promises = [];
  const userCount = 10;
  
  for (let i = 0; i < userCount; i++) {
    promises.push(testSingleUser(i));
  }
  
  const results = await Promise.all(promises);
  const successful = results.filter(r => r.success).length;
  const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length;
  
  console.log(`\n📊 Results:`);
  console.log(`   Successful requests: ${successful}/${userCount}`);
  console.log(`   Average response time: ${avgTime.toFixed(2)}ms`);
  console.log(`   Success rate: ${(successful/userCount*100).toFixed(1)}%`);
}

async function testSingleUser(userId) {
  const startTime = Date.now();
  
  try {
    const response = await fetch('https://whatthemenu.com');
    const endTime = Date.now();
    
    return {
      userId,
      success: response.ok,
      time: endTime - startTime,
      status: response.status
    };
  } catch (error) {
    return {
      userId,
      success: false,
      time: Date.now() - startTime,
      error: error.message
    };
  }
}

// Run both tests
async function runAllTests() {
  await testWebsiteLoad();
  await simulateLoad();
}

runAllTests().catch(console.error);