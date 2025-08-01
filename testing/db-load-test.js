// db-load-test.js - Test database performance under load

const { createClient } = require('@supabase/supabase-js');

class DatabaseLoadTester {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  // Test fuzzy search performance with many concurrent requests
  async testFuzzySearch() {
    console.log("Testing fuzzy search performance...");
    
    const testQueries = [
      "chicken tikka masala",
      "pad thai noodles", 
      "margherita pizza",
      "beef bourguignon",
      "sushi rolls",
      "fish and chips",
      "ramen bowl",
      "tacos al pastor"
    ];

    const concurrentTests = 50; // 50 simultaneous searches
    const promises = [];

    for (let i = 0; i < concurrentTests; i++) {
      const query = testQueries[i % testQueries.length];
      promises.push(this.performFuzzySearch(query, i));
    }

    const startTime = Date.now();
    const results = await Promise.all(promises);
    const endTime = Date.now();

    const successful = results.filter(r => r.success).length;
    const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;

    console.log(`Fuzzy Search Results:`);
    console.log(`- ${successful}/${concurrentTests} successful queries`);
    console.log(`- Average response time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`- Total test time: ${endTime - startTime}ms`);
  }

  async performFuzzySearch(dishName, index) {
    const startTime = Date.now();
    
    try {
      // This simulates your fuzzy search logic
      const { data, error } = await this.supabase
        .from('dishes')
        .select('*')
        .ilike('name', `%${dishName}%`)
        .limit(10);

      if (error) throw error;

      const responseTime = Date.now() - startTime;
      return {
        success: true,
        responseTime,
        index,
        resultsCount: data?.length || 0
      };
    } catch (error) {
      return {
        success: false,
        responseTime: Date.now() - startTime,
        index,
        error: error.message
      };
    }
  }

  // Test user counter updates under load
  async testCounterUpdates() {
    console.log("Testing counter updates under load...");
    
    const concurrentUpdates = 100;
    const promises = [];

    for (let i = 0; i < concurrentUpdates; i++) {
      promises.push(this.testCounterUpdate(i));
    }

    const startTime = Date.now();
    const results = await Promise.all(promises);
    const endTime = Date.now();

    const successful = results.filter(r => r.success).length;
    console.log(`Counter Update Results:`);
    console.log(`- ${successful}/${concurrentUpdates} successful updates`);
    console.log(`- Total time: ${endTime - startTime}ms`);
  }

  async testCounterUpdate(index) {
    try {
      // Test the RPC function for atomic counter updates
      const { error } = await this.supabase
        .rpc('increment_global_counter', { 
          counter_name: `test_counter_${index}` 
        });

      if (error) throw error;
      return { success: true, index };
    } catch (error) {
      return { success: false, index, error: error.message };
    }
  }

  // Test subscription expiration logic
  async testSubscriptionEdgeCases() {
    console.log("Testing subscription expiration edge cases...");
    
    const testCases = [
      { expires_at: new Date(Date.now() - 1000), expected: 'expired' },
      { expires_at: new Date(Date.now() + 86400000), expected: 'active' },
      { expires_at: null, expected: 'free' },
      { expires_at: new Date(Date.now() + 1000), expected: 'active' }
    ];

    for (const testCase of testCases) {
      const result = this.checkSubscriptionStatus(testCase.expires_at);
      console.log(`Expiry: ${testCase.expires_at} -> Status: ${result} (Expected: ${testCase.expected})`);
    }
  }

  checkSubscriptionStatus(expiresAt) {
    if (!expiresAt) return 'free';
    return new Date() >= new Date(expiresAt) ? 'expired' : 'active';
  }
}

// Run all tests
async function runDatabaseTests() {
  const tester = new DatabaseLoadTester();
  
  await tester.testFuzzySearch();
  await tester.testCounterUpdates();
  await tester.testSubscriptionEdgeCases();
}

module.exports = { DatabaseLoadTester, runDatabaseTests };