/**
 * Search Engine Configuration
 * Adjust these settings to fine-tune anti-blocking behavior
 */

const searchConfig = {
  // Rate limiting settings
  rateLimit: {
    maxRequestsPerMinute: 3,
    minDelayBetweenRequests: 20000, // 20 seconds
    burstAllowance: 1 // Allow 1 immediate request before rate limiting kicks in
  },
  
  // Google search settings
  google: {
    enabled: true,
    maxRetries: 3,
    timeouts: {
      browser: 30000,
      navigation: 30000,
      waitForResults: 20000
    },
    stealth: {
      randomizeViewport: true,
      randomizeUserAgent: true,
      humanLikeTyping: true,
      randomDelays: true,
      occasionalTypos: true // Very small chance of typos/corrections
    }
  },
  
  // DuckDuckGo fallback settings
  duckduckgo: {
    enabled: true,
    useAsFallback: true,
    timeouts: {
      browser: 30000,
      navigation: 30000,
      waitForResults: 15000
    }
  },
  
  // User agents for rotation
  userAgents: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:123.0) Gecko/20100101 Firefox/123.0'
  ],
  
  // Browser arguments for stealth
  browserArgs: {
    base: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--single-process',
      '--memory-pressure-off',
      '--max_old_space_size=4096'
    ],
    stealth: [
      '--disable-blink-features=AutomationControlled',
      '--disable-features=VizDisplayCompositor',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-web-security',
      '--disable-extensions',
      '--disable-plugins',
      '--disable-default-apps',
      '--disable-sync',
      '--disable-translate',
      '--hide-scrollbars',
      '--mute-audio',
      '--no-default-browser-check',
      '--no-pings',
      '--disable-background-networking',
      '--disable-client-side-phishing-detection',
      '--disable-component-update',
      '--disable-domain-reliability',
      '--disable-features=TranslateUI',
      '--disable-ipc-flooding-protection'
    ]
  },
  
  // Timing settings for human-like behavior
  timing: {
    minDelayBeforeStart: 2000,
    maxDelayBeforeStart: 5000,
    minDelayAfterNavigation: 2000,
    maxDelayAfterNavigation: 6000,
    minTypingDelay: 80,
    maxTypingDelay: 230,
    occasionalLongPause: 200, // Additional delay added 10% of the time
    minDelayBeforeSubmit: 1000,
    maxDelayBeforeSubmit: 3000
  },
  
  // Debugging and monitoring
  debug: {
    takeScreenshots: process.env.DEBUG_SCREENSHOTS === 'true',
    logDetailedErrors: process.env.NODE_ENV === 'development',
    logSuccessfulSearches: true
  },
  
  // Environment-specific overrides
  production: {
    debug: {
      takeScreenshots: false,
      logDetailedErrors: false
    },
    rateLimit: {
      maxRequestsPerMinute: 2, // More conservative in production
      minDelayBetweenRequests: 30000 // 30 seconds
    }
  }
};

// Apply environment-specific overrides
if (process.env.NODE_ENV === 'production') {
  Object.assign(searchConfig.debug, searchConfig.production.debug);
  Object.assign(searchConfig.rateLimit, searchConfig.production.rateLimit);
}

module.exports = searchConfig; 