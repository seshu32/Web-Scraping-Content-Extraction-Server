/**
 * Comprehensive Test Suite for Enhanced Anti-Blocking Features
 * Tests: Header rotation, Proxy support, Rate limiting, API fallback
 */

require('dotenv').config();

const { getRandomFingerprint } = require('./enhanced-headers');
const { selectHealthyProxy, testProxy, getProxyStats } = require('./proxy-rotation');
const { rateLimiter } = require('./adaptive-rate-limiter');
const { googleAPI } = require('./google-api');
const { enhancedScraper } = require('./enhanced-scraper');

console.log('🧪 Enhanced Anti-Blocking Test Suite');
console.log('=====================================\n');

/**
 * Test header rotation and fingerprinting
 */
async function testHeaderRotation() {
  console.log('🎭 Testing Header Rotation & Fingerprinting...');
  
  for (let i = 0; i < 3; i++) {
    const fingerprint = getRandomFingerprint();
    console.log(`  Fingerprint ${i + 1}:`);
    console.log(`    User-Agent: ${fingerprint.userAgent.substring(0, 60)}...`);
    console.log(`    Viewport: ${fingerprint.viewport.width}x${fingerprint.viewport.height}`);
    console.log(`    Platform: ${fingerprint.platform}`);
    console.log(`    Accept-Language: ${fingerprint.acceptLanguage}`);
  }
  
  console.log('✅ Header rotation test completed\n');
}

/**
 * Test proxy functionality
 */
async function testProxyRotation() {
  console.log('🌐 Testing Proxy Rotation...');
  
  const stats = getProxyStats();
  console.log(`  Total proxies configured: ${stats.total}`);
  console.log(`  Healthy proxies: ${stats.healthy}`);
  console.log(`  Failed proxies: ${stats.failed}`);
  
  if (stats.total > 0) {
    const proxy = selectHealthyProxy();
    if (proxy) {
      console.log(`  Selected proxy: ${proxy.server} (${proxy.country}, ${proxy.type})`);
      
      // Test proxy connectivity (commented out to avoid actual connections)
      // console.log('  Testing proxy connectivity...');
      // const isWorking = await testProxy(proxy);
      // console.log(`  Proxy test result: ${isWorking ? '✅ Working' : '❌ Failed'}`);
    } else {
      console.log('  No healthy proxies available');
    }
  } else {
    console.log('  No proxies configured (set PROXY_URL environment variable)');
  }
  
  console.log('✅ Proxy rotation test completed\n');
}

/**
 * Test adaptive rate limiting
 */
async function testRateLimiting() {
  console.log('⏱️ Testing Adaptive Rate Limiting...');
  
  const stats = rateLimiter.getStats();
  console.log(`  Current delay: ${Math.round(stats.currentDelay / 1000)}s`);
  console.log(`  Success rate: ${stats.successRate}%`);
  console.log(`  Recent successes: ${stats.recentSuccesses}`);
  console.log(`  Recent failures: ${stats.recentFailures}`);
  console.log(`  Requests in last minute: ${stats.requestsInLastMinute}`);
  console.log(`  Adaptive enabled: ${stats.adaptiveEnabled}`);
  
  console.log('  Simulating rate limit check...');
  const canMakeRequest = rateLimiter.canMakeRequest();
  console.log(`  Can make request: ${canMakeRequest ? '✅ Yes' : '❌ No'}`);
  
  if (canMakeRequest) {
    console.log('  Calculating next delay...');
    const delay = await rateLimiter.getNextDelay();
    console.log(`  Next delay would be: ${Math.round(delay / 1000)}s`);
  }
  
  console.log('✅ Rate limiting test completed\n');
}

/**
 * Test Google API integration
 */
async function testGoogleAPI() {
  console.log('🔍 Testing Google Custom Search API...');
  
  const isConfigured = googleAPI.isConfigured();
  console.log(`  API configured: ${isConfigured ? '✅ Yes' : '❌ No'}`);
  
  if (isConfigured) {
    const usage = googleAPI.getUsageStats();
    console.log(`  Daily usage: ${usage.requestsUsed}/${usage.dailyLimit} (${usage.usagePercentage}%)`);
    console.log(`  Requests remaining: ${usage.requestsRemaining}`);
    
    try {
      console.log('  Testing API connectivity...');
      const testResult = await googleAPI.testAPI();
      
      if (testResult.success) {
        console.log(`  ✅ API test successful - ${testResult.resultsReturned} results returned`);
      } else {
        console.log(`  ❌ API test failed: ${testResult.error}`);
      }
    } catch (error) {
      console.log(`  ❌ API test error: ${error.message}`);
    }
  } else {
    console.log('  Set GOOGLE_API_KEY and GOOGLE_SEARCH_ENGINE_ID to test API');
  }
  
  console.log('✅ Google API test completed\n');
}

/**
 * Test enhanced scraper integration
 */
async function testEnhancedScraper() {
  console.log('🚀 Testing Enhanced Scraper Integration...');
  
  const stats = enhancedScraper.getStats();
  console.log(`  Proxy enabled: ${stats.useProxy}`);
  console.log(`  Adaptive rate limiting: ${stats.useAdaptiveRateLimit}`);
  console.log(`  API fallback: ${stats.useApiFallback}`);
  
  try {
    console.log('  Testing enhanced search (dry run)...');
    const results = await enhancedScraper.searchGoogle('test query', 3);
    console.log(`  ✅ Enhanced search completed: ${results.results.length} results`);
    console.log(`  Search engine: ${results.searchEngine}`);
    console.log(`  Source: ${results.source}`);
  } catch (error) {
    console.log(`  ❌ Enhanced search failed: ${error.message}`);
  }
  
  console.log('✅ Enhanced scraper test completed\n');
}

/**
 * Test environment configuration
 */
function testEnvironmentConfig() {
  console.log('⚙️ Testing Environment Configuration...');
  
  const envVars = [
    'USE_PROXY',
    'PROXY_URL',
    'PROXY_USERNAME', 
    'PROXY_PASSWORD',
    'USE_ADAPTIVE_RATE_LIMIT',
    'USE_API_FALLBACK',
    'GOOGLE_API_KEY',
    'GOOGLE_SEARCH_ENGINE_ID'
  ];
  
  envVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✅ Set' : '❌ Not set';
    const displayValue = value ? (varName.includes('KEY') || varName.includes('PASSWORD') ? '***' : value) : 'undefined';
    console.log(`  ${varName}: ${status} (${displayValue})`);
  });
  
  console.log('✅ Environment configuration test completed\n');
}

/**
 * Display setup instructions
 */
function displaySetupInstructions() {
  console.log('📋 Setup Instructions for Full Anti-Blocking Protection');
  console.log('======================================================\n');
  
  console.log('1. 🌐 Proxy Setup (Optional but Recommended):');
  console.log('   export PROXY_URL="http://proxy-server:port"');
  console.log('   export PROXY_USERNAME="your-username"');
  console.log('   export PROXY_PASSWORD="your-password"');
  console.log('   export USE_PROXY="true"\n');
  
  console.log('2. 🔍 Google Custom Search API (Recommended for Reliability):');
  console.log('   - Get API key: https://developers.google.com/custom-search/v1/introduction');
  console.log('   - Create search engine: https://cse.google.com/cse/');
  console.log('   export GOOGLE_API_KEY="your-api-key"');
  console.log('   export GOOGLE_SEARCH_ENGINE_ID="your-search-engine-id"');
  console.log('   export USE_API_FALLBACK="true"\n');
  
  console.log('3. ⏱️ Rate Limiting (Enabled by Default):');
  console.log('   export USE_ADAPTIVE_RATE_LIMIT="true"  # Default: true\n');
  
  console.log('4. 🧪 Test Your Setup:');
  console.log('   npm run test-enhanced-anti-blocking\n');
  
  console.log('5. 🚀 Usage Examples:');
  console.log('   const { enhancedScraper } = require("./utils/enhanced-scraper");');
  console.log('   const results = await enhancedScraper.searchWithFallback("your query", 10);\n');
}

/**
 * Run all tests
 */
async function runAllTests() {
  try {
    await testHeaderRotation();
    await testProxyRotation();
    await testRateLimiting();
    await testGoogleAPI();
    await testEnhancedScraper();
    testEnvironmentConfig();
    
    console.log('🎉 All Enhanced Anti-Blocking Tests Completed!');
    console.log('===============================================\n');
    
    displaySetupInstructions();
    
  } catch (error) {
    console.error('❌ Test suite error:', error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testHeaderRotation,
  testProxyRotation,
  testRateLimiting,
  testGoogleAPI,
  testEnhancedScraper,
  runAllTests
}; 