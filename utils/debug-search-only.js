const { searchGoogle } = require('./scraper');

async function debugGoogleOnly() {
  console.log('🔍 Testing Google Search Only (No Fallback)');
  console.log('=' .repeat(50));
  
  try {
    const query = 'beforest';
    console.log(`🔍 Testing Google search for: "${query}"`);
    const startTime = Date.now();
    
    const results = await searchGoogle(query, 5);
    const endTime = Date.now();
    
    console.log(`✅ Google search successful!`);
    console.log(`⏱️  Time: ${(endTime - startTime) / 1000}s`);
    console.log(`📈 Results: ${results.length}`);
    
    if (results.length > 0) {
      console.log('\n📋 First few results:');
      results.slice(0, 3).forEach((result, index) => {
        console.log(`${index + 1}. ${result.title}`);
        console.log(`   🔗 ${result.link}`);
        console.log(`   📝 ${result.snippet.substring(0, 100)}...`);
        console.log('');
      });
    }
    
    return results;
    
  } catch (error) {
    console.log(`❌ Google search failed: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
    
    if (error.message.includes('Google is blocking')) {
      console.log('🛡️  This means Google blocking was detected correctly');
    }
    
    throw error;
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  debugGoogleOnly().catch(console.error);
}

module.exports = { debugGoogleOnly }; 