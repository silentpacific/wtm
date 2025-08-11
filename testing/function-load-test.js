// testing/function-load-test.js - Test Netlify Functions under load

async function testNetlifyFunctions() {
  console.log('⚙️  Testing Netlify Functions under load...');
  
  const functions = [
    {
      name: 'Contact Form',
      url: 'https://whatthemenu.com/.netlify/functions/contact-submit',
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Load testing message'
      }),
      headers: { 'Content-Type': 'application/json' }
    }
    // Add other functions when you have real API keys
  ];
  
  for (const func of functions) {
    console.log(`\n🔧 Testing function: ${func.name}`);
    
    const promises = [];
    const userCount = 5; // Start small for functions
    
    for (let i = 0; i < userCount; i++) {
      promises.push(testFunction(func, i));
    }
    
    const results = await Promise.all(promises);
    const successful = results.filter(r => r.success).length;
    const avgTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
    
    console.log(`   Results: ${successful}/${userCount} successful`);
    console.log(`   Average response time: ${avgTime.toFixed(0)}ms`);
    
    // Show any errors
    const errors = results.filter(r => !r.success);
    if (errors.length > 0) {
      console.log(`   ❌ Errors:`, errors.map(e => e.error));
    }
  }
}

async function testFunction(funcConfig, userId) {
  const startTime = Date.now();
  
  try {
    const response = await fetch(funcConfig.url, {
      method: funcConfig.method,
      headers: funcConfig.headers,
      body: funcConfig.body
    });
    
    const responseTime = Date.now() - startTime;
    
    return {
      userId,
      success: response.ok,
      responseTime,
      status: response.status
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

testNetlifyFunctions().catch(console.error);