const { searchGoogle } = require('./scraper');

async function debugGoogleSearch() {
  console.log('🚀 Starting Google Search Debug Session');
  console.log('=' .repeat(50));
  
  const query = 'beforest';
  const limit = 5;
  
  try {
    console.log(`🔍 Testing search for: "${query}"`);
    console.log(`📊 Result limit: ${limit}`);
    console.log('⏱️  This may take up to 60 seconds...');
    console.log('');
    
    const startTime = Date.now();
    const results = await searchGoogle(query, limit);
    const endTime = Date.now();
    
    console.log('');
    console.log('🎉 SUCCESS! Search completed');
    console.log(`⏱️  Time taken: ${(endTime - startTime) / 1000}s`);
    console.log(`📈 Results found: ${results.length}`);
    console.log('');
    
    if (results.length > 0) {
      console.log('📋 RESULTS:');
      console.log('-'.repeat(50));
      results.forEach((result, index) => {
        console.log(`${index + 1}. ${result.title}`);
        console.log(`   🔗 ${result.link}`);
        console.log(`   📝 ${result.snippet}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No results found');
    }
    
  } catch (error) {
    console.log('');
    console.log('❌ SEARCH FAILED');
    console.log('=' .repeat(50));
    console.log(`Error: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
    console.log('');
    console.log('📸 Check these debug screenshots:');
    console.log('  - debug-1-after-navigation.png');
    console.log('  - debug-2-blocking-detected.png (if blocking detected)');
    console.log('  - debug-3-no-search-input.png (if no search input found)');
    console.log('  - debug-4-after-typing.png');
    console.log('  - debug-5-after-search-submit.png');
    console.log('  - debug-6-no-results-found.png (if results not found)');
    console.log('  - debug-7-results-found.png (if results found)');
    console.log('');
    console.log('💡 Troubleshooting tips:');
    console.log('  1. Check if Google is showing CAPTCHA');
    console.log('  2. Verify network connectivity');
    console.log('  3. Check if Google changed their page structure');
    console.log('  4. Try running with headless: false to see browser');
  }
}

// Run the debug session
debugGoogleSearch().catch(console.error); 