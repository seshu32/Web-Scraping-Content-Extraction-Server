/**
 * Live Test Script for Enhanced Anti-Blocking Search
 * Tests the actual search functionality with a real query
 */

require('dotenv').config();
const { searchWithEnhancedAntiBlocking } = require('./utils/scraper');

async function testLiveSearch() {
  console.log('🧪 Testing Enhanced Anti-Blocking Search');
  console.log('=========================================\n');
  
  const testQuery = 'how to avoid google blocking web scraping';
  const limit = 5;
  
  console.log(`Search Query: "${testQuery}"`);
  console.log(`Results Limit: ${limit}`);
  console.log(`Use Proxy: ${process.env.USE_PROXY || 'false'}`);
  console.log(`API Fallback: ${process.env.USE_API_FALLBACK || 'true'}`);
  console.log(`Adaptive Rate Limit: ${process.env.USE_ADAPTIVE_RATE_LIMIT || 'true'}\n`);
  
  const startTime = Date.now();
  
  try {
    console.log('🚀 Starting enhanced search...\n');
    
    const results = await searchWithEnhancedAntiBlocking(testQuery, limit);
    
    const duration = Date.now() - startTime;
    
    console.log('\n✅ Search Results:');
    console.log('==================');
    console.log(`Query: ${results.query}`);
    console.log(`Count: ${results.count}`);
    console.log(`Search Engine: ${results.searchEngine}`);
    console.log(`Source: ${results.source}`);
    console.log(`Duration: ${duration}ms`);
    console.log(`Timestamp: ${results.timestamp}`);
    
    if (results.antiBlockingMeasures) {
      console.log('\n🛡️ Anti-Blocking Measures:');
      console.log(`  Header Rotation: ${results.antiBlockingMeasures.headerRotation ? '✅' : '❌'}`);
      console.log(`  Adaptive Rate Limit: ${results.antiBlockingMeasures.adaptiveRateLimit ? '✅' : '❌'}`);
      console.log(`  Proxy Support: ${results.antiBlockingMeasures.proxySupport ? '✅' : '❌'}`);
      console.log(`  API Fallback: ${results.antiBlockingMeasures.apiFallback ? '✅' : '❌'}`);
    }
    
    if (results.results && results.results.length > 0) {
      console.log(`\n📄 Found ${results.results.length} Results:`);
      console.log('============================');
      
      results.results.forEach((result, index) => {
        console.log(`\n${index + 1}. ${result.title}`);
        console.log(`   URL: ${result.url}`);
        console.log(`   Snippet: ${result.snippet ? result.snippet.substring(0, 100) + '...' : 'No snippet'}`);
      });
    } else {
      console.log('\n❌ No results found');
      if (results.error) {
        console.log(`Error: ${results.error}`);
      }
      if (results.suggestions) {
        console.log('\n💡 Suggestions:');
        results.suggestions.forEach(suggestion => {
          console.log(`  - ${suggestion}`);
        });
      }
    }
    
    console.log('\n🎉 Test completed successfully!');
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`\n❌ Test failed after ${duration}ms:`);
    console.error(`Error: ${error.message}`);
    console.error('Stack:', error.stack);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testLiveSearch().then(() => {
    console.log('\n✅ Test script finished');
    process.exit(0);
  }).catch(error => {
    console.error('\n❌ Test script failed:', error.message);
    process.exit(1);
  });
}

module.exports = { testLiveSearch }; 