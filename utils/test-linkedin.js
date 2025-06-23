const { extractContent, detectPlatform } = require('./scraper');

async function testLinkedInUrl(url) {
  console.log('🔍 Testing LinkedIn URL:', url);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    // First check platform detection
    const platformInfo = detectPlatform(url);
    console.log('📱 Platform Detection:', JSON.stringify(platformInfo, null, 2));
    
    // Try to extract content
    console.log('\n⏳ Attempting content extraction...');
    const result = await extractContent(url);
    
    console.log('\n📊 Extraction Results:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Title:', result.title);
    console.log('Platform:', result.platform || 'Not detected');
    console.log('Extraction Type:', result.extractionType);
    console.log('Login Required:', result.loginRequired || false);
    console.log('Is Empty:', result.isEmpty || false);
    console.log('Markdown Length:', result.markdown ? result.markdown.length : 0);
    
    if (result.debug) {
      console.log('\n🐛 Debug Info:');
      console.log(JSON.stringify(result.debug, null, 2));
    }
    
    console.log('\n📝 Markdown Preview (first 300 chars):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(result.markdown ? result.markdown.substring(0, 300) + '...' : 'No content');
    
    return result;
    
  } catch (error) {
    console.error('❌ Error testing LinkedIn URL:', error.message);
    return null;
  }
}

// Test a few different LinkedIn URL types
async function runTests() {
  const testUrls = [
    'https://www.linkedin.com/in/soundharya-somaraju-523b2811b/',
    'https://www.linkedin.com/company/microsoft/',
    'https://www.linkedin.com/posts/someone_post-id'
  ];
  
  for (const url of testUrls) {
    await testLinkedInUrl(url);
    console.log('\n' + '='.repeat(80) + '\n');
  }
}

// Run specific URL if provided as command line argument
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length > 0) {
    testLinkedInUrl(args[0]).catch(console.error);
  } else {
    console.log('Usage: node test-linkedin.js <linkedin-url>');
    console.log('Example: node test-linkedin.js "https://www.linkedin.com/in/someone"');
  }
}

module.exports = { testLinkedInUrl }; 