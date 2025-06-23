// LinkedIn Authenticated Scraping Examples
// Based on https://github.com/joeyism/linkedin_scraper approach

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

// Example 1: Manual Login (Most Ethical)
async function manualLoginExample() {
  console.log('📝 Example 1: Manual Login');
  console.log('This approach opens a browser where YOU log in manually');
  
  const response = await fetch(`${BASE_URL}/linkedin/scrape`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: 'https://www.linkedin.com/in/soundharya-somaraju-523b2811b/',
      manual: true  // User logs in manually
    })
  });
  
  const result = await response.json();
  console.log('Result:', result);
}

// Example 2: Automatic Login (Requires Credentials)
async function automaticLoginExample() {
  console.log('📝 Example 2: Automatic Login');
  console.log('⚠️ WARNING: Only use your own LinkedIn credentials');
  
  const response = await fetch(`${BASE_URL}/linkedin/scrape`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: 'https://www.linkedin.com/in/soundharya-somaraju-523b2811b/',
      email: 'your-email@example.com',    // Use your own credentials
      password: 'your-password',          // Use your own credentials
      manual: false
    })
  });
  
  const result = await response.json();
  console.log('Result:', result);
}

// Example 3: cURL Commands
function curlExamples() {
  console.log('\n📝 cURL Examples:');
  
  console.log('\n1. Manual Login:');
  console.log(`curl -X POST ${BASE_URL}/linkedin/scrape \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://www.linkedin.com/in/someone/",
    "manual": true
  }'`);
  
  console.log('\n2. Automatic Login:');
  console.log(`curl -X POST ${BASE_URL}/linkedin/scrape \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://www.linkedin.com/in/someone/",
    "email": "your-email@example.com",
    "password": "your-password"
  }'`);
}

// Example response format
function exampleResponse() {
  console.log('\n📝 Example Response:');
  console.log(JSON.stringify({
    "success": true,
    "data": {
      "name": "John Doe",
      "title": "Software Engineer at Tech Company",
      "about": "Passionate about technology and innovation...",
      "experiences": [
        {
          "title": "Software Engineer",
          "company": "Tech Company"
        }
      ],
      "url": "https://www.linkedin.com/in/john-doe/",
      "scrapedAt": "2024-01-01T12:00:00.000Z"
    },
    "method": "manual-login",
    "warning": "The profile owner may see that you viewed their profile",
    "extractedAt": "2024-01-01T12:00:00.000Z"
  }, null, 2));
}

// Important considerations
function importantNotes() {
  console.log('\n⚠️ IMPORTANT CONSIDERATIONS:');
  console.log('');
  console.log('✅ ETHICAL USAGE:');
  console.log('- Only use your own LinkedIn credentials');
  console.log('- Respect LinkedIn\'s Terms of Service');
  console.log('- Be aware that profile owners can see you viewed them');
  console.log('- Use sparingly to avoid rate limiting');
  console.log('');
  console.log('🔒 PRIVACY & SECURITY:');
  console.log('- Never share or store others\' credentials');
  console.log('- Use HTTPS in production');
  console.log('- Consider using environment variables for credentials');
  console.log('- Prefer manual login for better security');
  console.log('');
  console.log('⚖️ LEGAL COMPLIANCE:');
  console.log('- Ensure you have permission to scrape profiles');
  console.log('- Follow data protection regulations (GDPR, etc.)');
  console.log('- Respect LinkedIn\'s robots.txt and rate limits');
  console.log('- Consider using LinkedIn\'s official API instead');
}

// Run examples
if (require.main === module) {
  console.log('🔗 LinkedIn Authenticated Scraping Examples');
  console.log('Based on https://github.com/joeyism/linkedin_scraper\n');
  
  curlExamples();
  exampleResponse();
  importantNotes();
  
  console.log('\n🚀 To test:');
  console.log('1. Start the server: npm start');
  console.log('2. Use the cURL commands above');
  console.log('3. Or uncomment and run the JavaScript examples');
  
  // Uncomment to run actual examples:
  // manualLoginExample().catch(console.error);
  // automaticLoginExample().catch(console.error);
}

module.exports = {
  manualLoginExample,
  automaticLoginExample
}; 