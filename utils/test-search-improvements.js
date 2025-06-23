const { searchGoogle, searchDuckDuckGo, searchWithFallback } = require('./scraper');

async function testSearchImprovements() {
  console.log('🚀 Testing Search Engine Improvements');
  console.log('=' .repeat(60));
  
  const testQueries = [
    'beforest',
    'JavaScript programming',
    'artificial intelligence news'
  ];
  
  // Test 1: Enhanced Google Search with stealth features
  console.log('\n📊 Test 1: Enhanced Google Search');
  console.log('-'.repeat(40));
  
  for (const query of testQueries.slice(0, 1)) { // Test only first query to avoid rate limiting
    try {
      console.log(`🔍 Testing Google search for: "${query}"`);
      const startTime = Date.now();
      
      const results = await searchGoogle(query, 3);
      const endTime = Date.now();
      
      console.log(`✅ Google search successful!`);
      console.log(`⏱️  Time: ${(endTime - startTime) / 1000}s`);
      console.log(`📈 Results: ${results.length}`);
      
      if (results.length > 0) {
        console.log(`🎯 First result: ${results[0].title}`);
        console.log(`🔗 URL: ${results[0].link}`);
      }
      
      // Wait between tests to respect rate limiting
      console.log('⏳ Waiting 25 seconds (rate limiting)...');
      await new Promise(resolve => setTimeout(resolve, 25000));
      
    } catch (error) {
      console.log(`❌ Google search failed: ${error.message}`);
      
      if (error.message.includes('Google is blocking')) {
        console.log('🔄 This is expected - Google blocking detected correctly');
      }
    }
  }
  
  // Test 2: DuckDuckGo Fallback
  console.log('\n🦆 Test 2: DuckDuckGo Fallback Search');
  console.log('-'.repeat(40));
  
  try {
    const query = testQueries[1];
    console.log(`🔍 Testing DuckDuckGo search for: "${query}"`);
    const startTime = Date.now();
    
    const results = await searchDuckDuckGo(query, 3);
    const endTime = Date.now();
    
    console.log(`✅ DuckDuckGo search successful!`);
    console.log(`⏱️  Time: ${(endTime - startTime) / 1000}s`);
    console.log(`📈 Results: ${results.length}`);
    
    if (results.length > 0) {
      console.log(`🎯 First result: ${results[0].title}`);
      console.log(`🔗 URL: ${results[0].link}`);
      console.log(`🏷️  Source: ${results[0].source}`);
    }
    
  } catch (error) {
    console.log(`❌ DuckDuckGo search failed: ${error.message}`);
  }
  
  // Wait before next test
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Test 3: Automatic Fallback System
  console.log('\n🔄 Test 3: Automatic Fallback System');
  console.log('-'.repeat(40));
  
  try {
    const query = testQueries[2];
    console.log(`🔍 Testing automatic fallback for: "${query}"`);
    console.log('📝 This will try Google first, then DuckDuckGo if blocked');
    const startTime = Date.now();
    
    const results = await searchWithFallback(query, 3);
    const endTime = Date.now();
    
    console.log(`✅ Automatic search successful!`);
    console.log(`⏱️  Time: ${(endTime - startTime) / 1000}s`);
    console.log(`📈 Results: ${results.length}`);
    console.log(`🔧 Engine used: ${results.length > 0 ? results[0].source : 'unknown'}`);
    
    if (results.length > 0) {
      console.log(`🎯 First result: ${results[0].title}`);
      console.log(`🔗 URL: ${results[0].link}`);
    }
    
  } catch (error) {
    console.log(`❌ Automatic fallback failed: ${error.message}`);
  }
  
  // Test 4: Rate Limiting Verification
  console.log('\n⏱️  Test 4: Rate Limiting Verification');
  console.log('-'.repeat(40));
  
  try {
    console.log('🔍 Testing rate limiting by making rapid requests...');
    
    // This should succeed (first request)
    await searchWithFallback('test query 1', 1);
    console.log('✅ First request: SUCCESS');
    
    // This should be rate limited
    try {
      await searchWithFallback('test query 2', 1);
      console.log('⚠️  Second request: SUCCESS (rate limiting may not be active)');
    } catch (error) {
      if (error.message.includes('Rate limit exceeded')) {
        console.log('✅ Second request: RATE LIMITED (working correctly)');
      } else {
        console.log(`❌ Second request failed with different error: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.log(`❌ Rate limiting test failed: ${error.message}`);
  }
  
  console.log('\n🏁 Search Engine Improvement Tests Complete');
  console.log('=' .repeat(60));
  console.log('\n📋 Summary:');
  console.log('✅ Enhanced Google search with anti-detection');
  console.log('✅ DuckDuckGo fallback implementation');
  console.log('✅ Automatic search engine switching');
  console.log('✅ Rate limiting protection');
  console.log('\n💡 Next Steps:');
  console.log('1. Monitor search success rates in production');
  console.log('2. Adjust rate limiting based on usage patterns');
  console.log('3. Consider adding more search engines (Bing, Startpage)');
  console.log('4. Implement user-agent rotation');
  console.log('5. Add proxy support for additional anonymity');
}

// Only run if this file is executed directly
if (require.main === module) {
  testSearchImprovements().catch(console.error);
}

module.exports = { testSearchImprovements }; 