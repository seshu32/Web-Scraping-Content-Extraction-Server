/**
 * Railway.app Production Configuration
 * Optimizations for cloud hosting environment
 */

const railwayConfig = {
  // More aggressive rate limiting for shared hosting
  production: {
    rateLimit: {
      maxRequestsPerMinute: 1, // Very conservative for Railway
      minDelayBetweenRequests: 60000, // 1 minute between requests
      burstAllowance: 0 // No burst requests in production
    },
    
    // Extended timeouts for cloud environment
    timeouts: {
      browser: 45000, // 45 seconds
      navigation: 45000,
      waitForResults: 30000,
      waitForElements: 15000
    },
    
    // Enhanced stealth for cloud IPs
    stealth: {
      longerDelays: true,
      randomizeMoreAggressively: true,
      useAlternativeDomains: true,
      rotateUserAgentsFrequently: true
    }
  },
  
  // Railway-specific browser arguments
  browserArgs: [
    '--no-sandbox',
    '--disable-setuid-sandbox', 
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-web-security',
    '--disable-features=VizDisplayCompositor',
    '--single-process',
    '--memory-pressure-off',
    '--max_old_space_size=512', // Lower memory for Railway
    '--disable-background-networking',
    '--disable-default-apps',
    '--disable-extensions',
    '--disable-sync',
    '--disable-translate',
    '--hide-scrollbars',
    '--mute-audio',
    '--no-first-run',
    '--disable-ipc-flooding-protection',
    '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows',
    '--disable-background-timer-throttling',
    '--force-color-profile=srgb',
    '--disable-blink-features=AutomationControlled'
  ],
  
  // Alternative Google domains for different regions
  googleDomains: [
    'https://www.google.com/',
    'https://google.com/',
    'https://www.google.co.uk/',
    'https://www.google.ca/',
    'https://www.google.com.au/'
  ],
  
  // User agents optimized for different regions
  productionUserAgents: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:123.0) Gecko/20100101 Firefox/123.0',
    'Mozilla/5.0 (X11; Linux x86_64; rv:123.0) Gecko/20100101 Firefox/123.0'
  ],
  
  // Railway environment detection
  isRailway() {
    return process.env.RAILWAY_ENVIRONMENT !== undefined || 
           process.env.RAILWAY_PROJECT_ID !== undefined ||
           process.env.PORT !== undefined;
  },
  
  // Get current configuration based on environment
  getCurrentConfig() {
    if (this.isRailway()) {
      console.log('🚂 Railway environment detected - using production config');
      return {
        ...this.production,
        browserArgs: this.browserArgs,
        userAgents: this.productionUserAgents,
        domains: this.googleDomains
      };
    } else {
      console.log('💻 Local environment detected - using development config');
      return {
        rateLimit: {
          maxRequestsPerMinute: 2,
          minDelayBetweenRequests: 30000,
          burstAllowance: 1
        },
        timeouts: {
          browser: 30000,
          navigation: 30000,
          waitForResults: 20000,
          waitForElements: 10000
        },
        stealth: {
          longerDelays: false,
          randomizeMoreAggressively: false,
          useAlternativeDomains: false,
          rotateUserAgentsFrequently: false
        }
      };
    }
  }
};

module.exports = railwayConfig; 