// testing/heavy-load-test.js - Heavy load simulation

async function heavyLoadTest() {
  console.log('🔥 Starting heavy load test (Product Hunt simulation)...');
  
  const scenarios = [
    { name: 'Homepage visitors', url: 'https://whatthemenu.com', users: 25 },
    { name: 'Pricing page', url: 'https://whatthemenu.com/#pricing', users: 15 },
    { name: 'Contact page', url: 'https://whatthemenu.com/contact', users: 10 }
  ];
  
  for (const scenario of scenarios) {
    console.log(`\n📊 Testing: ${scenario.name} with ${scenario.users} concurrent users`);
    
    const promises = [];
    const startTime = Date.now();
    
    for (let i = 0; i < scenario.users; i++) {
      promises.push(testUser(scenario.url, i));
    }
    
    const results = await Promise.all(promises);
    const endTime = Date.now();
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
    const maxResponseTime = Math.max(...results.map(r => r.responseTime));
    const minResponseTime = Math.min(...results.map(r => r.responseTime));
    
    console.log(`   ✅ Successful: ${successful}/${scenario.users} (${(successful/scenario.users*100).toFixed(1)}%)`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   ⏱️  Average response: ${avgResponseTime.toFixed(0)}ms`);
    console.log(`   ⚡ Fastest: ${minResponseTime}ms`);
    console.log(`   🐌 Slowest: ${maxResponseTime}ms`);
    console.log(`   🕐 Total test time: ${endTime - startTime}ms`);
    
    // Wait between scenarios to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n🎯 Heavy load test complete!');
}

async function testUser(url, userId) {
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': `LoadTest-User-${userId}`,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    
    const responseTime = Date.now() - startTime;
    
    return {
      userId,
      success: response.ok,
      responseTime,
      status: response.status,
      contentLength: response.headers.get('content-length')
    };
    
  } catch (error) {
    return {
      userId,
      success: false,
      responseTime: Date.now() - startTime,
      error: error.message
    };
  }
}

// Run the test
heavyLoadTest().catch(console.error);