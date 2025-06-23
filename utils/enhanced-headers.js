/**
 * Enhanced Headers and User-Agent Rotation
 * Real browser fingerprints to avoid detection
 */

const browserFingerprints = [
  {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    platform: 'Win32',
    acceptLanguage: 'en-US,en;q=0.9',
    acceptEncoding: 'gzip, deflate, br',
    referer: 'https://www.google.com/',
    screenResolution: { width: 1920, height: 1080, colorDepth: 24 }
  },
  {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 900 },
    platform: 'MacIntel',
    acceptLanguage: 'en-US,en;q=0.9',
    acceptEncoding: 'gzip, deflate, br',
    referer: 'https://www.google.com/',
    screenResolution: { width: 1440, height: 900, colorDepth: 24 }
  },
  {
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    viewport: { width: 1366, height: 768 },
    platform: 'Linux x86_64',
    acceptLanguage: 'en-US,en;q=0.9',
    acceptEncoding: 'gzip, deflate, br',
    referer: 'https://www.google.com/',
    screenResolution: { width: 1366, height: 768, colorDepth: 24 }
  },
  {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
    viewport: { width: 1280, height: 720 },
    platform: 'Win32',
    acceptLanguage: 'en-US,en;q=0.5',
    acceptEncoding: 'gzip, deflate, br',
    referer: 'https://www.google.com/',
    screenResolution: { width: 1280, height: 720, colorDepth: 24 }
  },
  {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:123.0) Gecko/20100101 Firefox/123.0',
    viewport: { width: 1680, height: 1050 },
    platform: 'MacIntel',
    acceptLanguage: 'en-US,en;q=0.5',
    acceptEncoding: 'gzip, deflate, br',
    referer: 'https://www.google.com/',
    screenResolution: { width: 1680, height: 1050, colorDepth: 24 }
  }
];

const commonReferers = [
  'https://www.google.com/',
  'https://duckduckgo.com/',
  'https://www.bing.com/',
  'https://www.yahoo.com/',
  'https://www.ecosia.org/',
  'https://startpage.com/',
  ''
];

const acceptLanguages = [
  'en-US,en;q=0.9',
  'en-US,en;q=0.9,es;q=0.8',
  'en-US,en;q=0.9,fr;q=0.8',
  'en-GB,en-US;q=0.9,en;q=0.8',
  'en-US,en;q=0.8,de;q=0.7'
];

const dnts = ['1', '0', ''];

/**
 * Get a random browser fingerprint
 * @returns {Object} Complete browser fingerprint
 */
function getRandomFingerprint() {
  const baseFingerprint = browserFingerprints[Math.floor(Math.random() * browserFingerprints.length)];
  
  return {
    ...baseFingerprint,
    viewport: {
      width: baseFingerprint.viewport.width + Math.floor(Math.random() * 100) - 50,
      height: baseFingerprint.viewport.height + Math.floor(Math.random() * 100) - 50
    }
  };
}

/**
 * Generate comprehensive HTTP headers for anti-detection
 * @param {Object} fingerprint - Browser fingerprint
 * @returns {Object} HTTP headers object
 */
function generateHeaders(fingerprint) {
  const headers = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': fingerprint.acceptLanguage,
    'Accept-Encoding': fingerprint.acceptEncoding,
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0'
  };
  
  // Add referer if not empty
  if (fingerprint.referer) {
    headers['Referer'] = fingerprint.referer;
  }
  
  // Add DNT if not empty
  if (fingerprint.dnt) {
    headers['DNT'] = fingerprint.dnt;
  }
  
  // Randomly add some additional headers
  if (Math.random() > 0.5) {
    headers['Sec-CH-UA'] = '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"';
    headers['Sec-CH-UA-Mobile'] = '?0';
    headers['Sec-CH-UA-Platform'] = `"${fingerprint.platform.includes('Win') ? 'Windows' : fingerprint.platform.includes('Mac') ? 'macOS' : 'Linux'}"`;
  }
  
  return headers;
}

/**
 * Create browser context with enhanced fingerprint
 * @param {Object} browser - Playwright browser instance
 * @param {Object} fingerprint - Browser fingerprint
 * @returns {Object} Browser context
 */
async function createStealthContext(browser, fingerprint = null) {
  if (!fingerprint) {
    fingerprint = getRandomFingerprint();
  }
  
  const headers = generateHeaders(fingerprint);
  
  console.log(`🎭 Using fingerprint: ${fingerprint.userAgent.substring(0, 50)}...`);
  console.log(`📱 Viewport: ${fingerprint.viewport.width}x${fingerprint.viewport.height}`);
  console.log(`🌍 Platform: ${fingerprint.platform}`);
  
  const context = await browser.newContext({
    userAgent: fingerprint.userAgent,
    viewport: fingerprint.viewport,
    locale: 'en-US',
    timezoneId: 'America/New_York',
    permissions: [],
    extraHTTPHeaders: headers,
    screen: fingerprint.screenResolution,
    deviceScaleFactor: 1
  });
  
  return { context, fingerprint };
}

/**
 * Advanced stealth script injection
 * @param {Object} page - Playwright page instance
 * @param {Object} fingerprint - Browser fingerprint
 */
async function injectAdvancedStealth(page, fingerprint) {
  await page.addInitScript((fp) => {
    // Remove webdriver property
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    });
    
    // Override the plugins property
    Object.defineProperty(navigator, 'plugins', {
      get: () => [
        { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
        { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
        { name: 'Native Client', filename: 'internal-nacl-plugin' }
      ],
    });
    
    // Override the languages property
    Object.defineProperty(navigator, 'languages', {
      get: () => fp.acceptLanguage.split(',').map(lang => lang.split(';')[0].trim()),
    });
    
    // Override platform
    Object.defineProperty(navigator, 'platform', {
      get: () => fp.platform,
    });
    
    // Override screen properties
    Object.defineProperty(screen, 'width', { get: () => fp.screenResolution.width });
    Object.defineProperty(screen, 'height', { get: () => fp.screenResolution.height });
    Object.defineProperty(screen, 'colorDepth', { get: () => fp.screenResolution.colorDepth });
    
    // Override permissions
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) => (
      parameters.name === 'notifications' ?
        Promise.resolve({ state: Notification.permission }) :
        originalQuery(parameters)
    );
    
    // Mock chrome runtime
    if (!window.chrome) {
      window.chrome = {
        runtime: {}
      };
    }
    
    // Hide automation indicators
    delete navigator.__proto__.webdriver;
    
    // Override getBattery if it exists
    if (navigator.getBattery) {
      navigator.getBattery = () => Promise.resolve({
        charging: true,
        chargingTime: 0,
        dischargingTime: Infinity,
        level: 1,
      });
    }
    
    // Spoof canvas fingerprinting
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type) {
      if (type === '2d') {
        const context = getContext.apply(this, arguments);
        const getImageData = context.getImageData;
        context.getImageData = function() {
          const imageData = getImageData.apply(this, arguments);
          // Add subtle noise to canvas fingerprint
          for (let i = 0; i < imageData.data.length; i += 4) {
            imageData.data[i] += Math.floor(Math.random() * 3) - 1;
          }
          return imageData;
        };
        return context;
      }
      return getContext.apply(this, arguments);
    };
    
    // Spoof WebGL fingerprinting
    const getParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(parameter) {
      if (parameter === 37445) {
        return 'Intel Inc.';
      }
      if (parameter === 37446) {
        return 'Intel(R) Iris(TM) Graphics 6100';
      }
      return getParameter.apply(this, arguments);
    };
    
  }, fingerprint);
}

module.exports = {
  getRandomFingerprint,
  generateHeaders,
  createStealthContext,
  injectAdvancedStealth,
  browserFingerprints
}; 