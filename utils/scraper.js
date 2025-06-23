const { chromium } = require('playwright');
const TurndownService = require('turndown');

// Initialize turndown service for HTML to Markdown conversion
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
});

// Configure turndown to handle more elements
turndownService.addRule('strikethrough', {
  filter: ['del', 's'],
  replacement: function (content) {
    return '~~' + content + '~~';
  }
});

/**
 * Search Google and extract results
 * @param {string} query - Search query
 * @param {number} limit - Maximum number of results to return
 * @returns {Array} Array of search results
 */
async function searchGoogle(query, limit = 10) {
  const browser = await chromium.launch({
    headless: true, // Back to headless for normal operation
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-blink-features=AutomationControlled', // Hide automation
      '--disable-features=VizDisplayCompositor'
    ]
  });
  
  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      viewport: { width: 1366, height: 768 }, // More common resolution
      locale: 'en-US',
      timezoneId: 'America/New_York',
      permissions: [], // No special permissions
      extraHTTPHeaders: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    });
    
    const page = await context.newPage();
    
    // Hide webdriver property
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });
    
    console.log('🔍 Starting stealthy Google search...');
    
    // Navigate to Google homepage first (more natural)
    await page.goto('https://www.google.com/', { 
      waitUntil: 'domcontentloaded', 
      timeout: 30000 
    });
    
    // Random delay to mimic human behavior
    await page.waitForTimeout(Math.random() * 2000 + 1000);
    
    // Check for blocking immediately
    const currentUrl = page.url();
    if (currentUrl.includes('/sorry/') || currentUrl.includes('captcha')) {
      throw new Error(`Google is blocking requests. Current URL: ${currentUrl}`);
    }
    
    // Accept cookies if prompted
    try {
      const cookieSelectors = [
        'button:has-text("Accept")',
        'button:has-text("I agree")',  
        'button:has-text("Accept all")',
        '#L2AGLb',
        '[aria-label*="Accept"]'
      ];
      
      for (const selector of cookieSelectors) {
        try {
          const cookieButton = await page.$(selector);
          if (cookieButton) {
            console.log(`Accepting cookies...`);
            await page.click(selector, { timeout: 2000 });
            await page.waitForTimeout(1000);
            break;
          }
        } catch {
          continue;
        }
      }
    } catch {
      // No cookies to accept
    }
    
    // Find search input with better selectors
    const searchInputSelectors = [
      'input[name="q"]:not([type="hidden"])',
      'textarea[name="q"]',
      '[aria-label="Search"]',
      '#APjFqb',
      '.gLFyf'
    ];
    
    let searchInput = null;
    for (const selector of searchInputSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 10000 });
        searchInput = await page.$(selector);
        if (searchInput && await searchInput.isVisible()) {
          console.log(`Found search input: ${selector}`);
          break;
        }
      } catch {
        continue;
      }
    }
    
    if (!searchInput) {
      throw new Error('Could not find visible Google search input field');
    }
    
    // Human-like interaction with search input
    await searchInput.click();
    await page.waitForTimeout(Math.random() * 500 + 300);
    
    // Clear and type with human-like delays
    await searchInput.fill('');
    await page.waitForTimeout(200);
    
    // Type character by character with random delays
    for (const char of query) {
      await searchInput.type(char, { delay: Math.random() * 100 + 50 });
    }
    
    // Random pause before submitting
    await page.waitForTimeout(Math.random() * 1000 + 500);
    
    // Submit search (prefer Enter key as it's more natural)
    await page.keyboard.press('Enter');
    
    // Wait for navigation with longer timeout
    try {
      await page.waitForURL('**/search?**', { timeout: 15000 });
    } catch {
      // If URL doesn't change as expected, check current URL
      const finalUrl = page.url();
      if (finalUrl.includes('/sorry/') || finalUrl.includes('captcha')) {
        throw new Error(`Google blocked the search request. URL: ${finalUrl}`);
      }
    }
    
    // Check for blocking after search
    const searchUrl = page.url();
    if (searchUrl.includes('/sorry/') || searchUrl.includes('captcha')) {
      throw new Error(`Google is blocking search results. URL: ${searchUrl}`);
    }
    
    // Wait for results with improved selectors
    const resultSelectors = [
      '#search .g', 
      '#rso .g',
      '.tF2Cxc',
      '[data-sokoban-container] .g',
      '#search [jscontroller]'
    ];
    
    let resultsFound = false;
    for (const selector of resultSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 20000 });
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          console.log(`Found ${elements.length} results with: ${selector}`);
          resultsFound = true;
          break;
        }
      } catch {
        continue;
      }
    }
    
    if (!resultsFound) {
      // Final check for blocking
      const finalUrl = page.url();
      const pageTitle = await page.title();
      
      if (finalUrl.includes('/sorry/') || finalUrl.includes('captcha') || 
          pageTitle.toLowerCase().includes('captcha')) {
        throw new Error(`Google is blocking requests. Please try again later or use a different approach.`);
      }
      
      throw new Error('Search results did not load - no result containers found');
    }
    
    // DEBUG: Check what's actually on the page
    const pageAnalysis = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        bodyText: document.body.textContent.substring(0, 1000),
        hasSearchDiv: !!document.querySelector('#search'),
        hasRsoDiv: !!document.querySelector('#rso'),
        hasGClass: !!document.querySelector('.g'),
        hasTF2Cxc: !!document.querySelector('.tF2Cxc'),
        allDivIds: Array.from(document.querySelectorAll('div[id]')).map(div => div.id).slice(0, 20),
        allDivClasses: Array.from(document.querySelectorAll('div[class]')).map(div => div.className).slice(0, 20)
      };
    });
    
    console.log('🔍 DEBUG: Page analysis:', JSON.stringify(pageAnalysis, null, 2));
    
    // Extract search results
    const results = await page.evaluate((maxResults) => {
      const searchResults = [];
      
      // Multiple selectors to find result containers
      const containerSelectors = [
        '#search .g',
        '#rso .g', 
        '.g',
        '[data-sokoban-container]',
        '.tF2Cxc'
      ];
      
      let resultElements = [];
      for (const selector of containerSelectors) {
        resultElements = document.querySelectorAll(selector);
        if (resultElements.length > 0) {
          console.log(`Found ${resultElements.length} results with selector: ${selector}`);
          break;
        }
      }
      
      for (let i = 0; i < Math.min(resultElements.length, maxResults); i++) {
        const element = resultElements[i];
        
        // Extract title and link with multiple selectors
        const titleSelectors = ['h3', '.LC20lb', '.DKV0Md'];
        const linkSelectors = ['a[href]', 'a'];
        
        let titleElement = null;
        let linkElement = null;
        
        for (const selector of titleSelectors) {
          titleElement = element.querySelector(selector);
          if (titleElement) break;
        }
        
        for (const selector of linkSelectors) {
          linkElement = element.querySelector(selector);
          if (linkElement && linkElement.href && !linkElement.href.includes('google.com/search')) {
            break;
          }
        }
        
        if (titleElement && linkElement) {
          const title = titleElement.textContent.trim();
          const link = linkElement.href;
          
          // Extract snippet/description with multiple selectors
          let snippet = '';
          const snippetSelectors = [
            '[data-sn="snippet"]',
            '.VwiC3b',
            '.s',
            '.aCOpRe',
            '.yXK7lf'
          ];
          
          for (const selector of snippetSelectors) {
            const snippetElement = element.querySelector(selector);
            if (snippetElement) {
              snippet = snippetElement.textContent.trim();
              break;
            }
          }
          
          // Extract displayed URL with multiple selectors
          let displayUrl = '';
          const urlSelectors = ['cite', '.tjvcx', '.UdQypb', '.iUh30'];
          
          for (const selector of urlSelectors) {
            const urlElement = element.querySelector(selector);
            if (urlElement) {
              displayUrl = urlElement.textContent.trim();
              break;
            }
          }
          
          if (title && link && !link.includes('google.com/search')) {
            searchResults.push({
              title,
              link,
              snippet,
              displayUrl,
              position: i + 1
            });
          }
        }
      }
      
      return searchResults;
    }, limit);
    
    return results;
    
  } finally {
    await browser.close();
  }
}

/**
 * Check if URL is from a platform that requires special handling
 * @param {string} url - URL to check
 * @returns {object} - Platform info and handling strategy
 */
function detectPlatform(url) {
  const urlObj = new URL(url);
  const hostname = urlObj.hostname.toLowerCase();
  
  if (hostname.includes('linkedin.com')) {
    // More specific detection of potentially public LinkedIn content
    const isCompanyPage = urlObj.pathname.includes('/company/');
    const isSchoolPage = urlObj.pathname.includes('/school/');
    const isPublicPost = urlObj.pathname.includes('/posts/') && !urlObj.pathname.includes('/in/');
    const isShowcase = urlObj.pathname.includes('/showcase/');
    
    return {
      platform: 'linkedin',
      requiresAuth: true,
      publicContentPossible: isCompanyPage || isSchoolPage || isPublicPost || isShowcase,
      contentType: isCompanyPage ? 'company' : isSchoolPage ? 'school' : isPublicPost ? 'post' : 'profile'
    };
  }
  
  if (hostname.includes('facebook.com') || hostname.includes('fb.com')) {
    return {
      platform: 'facebook',
      requiresAuth: true,
      publicContentPossible: hostname.includes('facebook.com/pages')
    };
  }
  
  if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
    return {
      platform: 'twitter',
      requiresAuth: false,
      publicContentPossible: true
    };
  }
  
  return {
    platform: 'general',
    requiresAuth: false,
    publicContentPossible: true
  };
}

/**
 * Extract content from a URL and convert to markdown
 * @param {string} url - URL to extract content from
 * @param {boolean} fullPage - Whether to extract complete page or just main content
 * @param {boolean} includeImages - Whether to include images in the output
 * @returns {string} Content in markdown format
 */
async function extractContent(url, fullPage = false, includeImages = true) {
  // Detect platform and handle special cases
  const platformInfo = detectPlatform(url);
  
  // Handle LinkedIn URLs with special message
  if (platformInfo.platform === 'linkedin' && platformInfo.requiresAuth && !platformInfo.publicContentPossible) {
    return {
      title: 'LinkedIn Content Requires Authentication',
      markdown: `# LinkedIn Content Not Available

This LinkedIn URL requires authentication to access content: ${url}

## Alternatives:
- **LinkedIn API**: Use LinkedIn's official API with proper authentication
- **Manual Copy**: Copy and paste the content manually
- **Public Company Pages**: Some LinkedIn company pages may be publicly accessible
- **Professional Networks**: Consider alternative professional networking platforms

## Note:
LinkedIn protects user privacy by requiring login for most profile and post content.`,
      url: url,
      extractionType: 'authentication-required',
      platform: 'linkedin'
    };
  }
  
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  });
  
  try {
    // Adjust context based on platform
    let contextOptions = {
      viewport: { width: 1280, height: 720 },
      locale: 'en-US'
    };
    
    // Use different user agents for different platforms
    if (platformInfo.platform === 'linkedin') {
      // Try a search engine bot user agent for LinkedIn
      contextOptions.userAgent = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
    } else if (platformInfo.platform === 'twitter') {
      // Twitter-friendly user agent
      contextOptions.userAgent = 'Mozilla/5.0 (compatible; Twitterbot/1.0)';
    } else {
      // General purpose user agent
      contextOptions.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    }
    
    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();
    
    // Set a reasonable timeout
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Check for login/authentication requirements
    const pageContent = await page.content();
    const pageTitle = await page.title();
    
    const loginIndicators = [
      'sign in',
      'log in', 
      'login',
      'authentication required',
      'please sign in',
      'member login',
      'join linkedin',
      'this content is not available',
      'linkedin login',
      'access linkedin'
    ];
    
    const hasLoginRequirement = loginIndicators.some(indicator => 
      pageContent.toLowerCase().includes(indicator.toLowerCase())
    );
    
    // Check for empty or minimal content (common LinkedIn bot response)
    const bodyText = await page.evaluate(() => {
      return document.body ? document.body.innerText.trim() : '';
    });
    
    const contentLength = bodyText.length;
    const isEmptyContent = contentLength < 100; // Very little actual content
    const isLinkedInTitle = pageTitle.toLowerCase().includes('linkedin') || pageTitle === '';
    
    // Special handling for LinkedIn
    if (platformInfo.platform === 'linkedin') {
      // Detect various LinkedIn blocking scenarios
      if (hasLoginRequirement || isEmptyContent || isLinkedInTitle || contentLength < 200) {
        
        // Try to get any available info from the page
        const availableInfo = await page.evaluate(() => {
          // Try to extract any visible text or meta information
          const metaDescription = document.querySelector('meta[name="description"]');
          const h1 = document.querySelector('h1');
          const profileName = document.querySelector('[data-generated-suggestion-target]');
          
          return {
            description: metaDescription ? metaDescription.content : '',
            heading: h1 ? h1.textContent.trim() : '',
            profileInfo: profileName ? profileName.textContent.trim() : '',
            bodyLength: document.body ? document.body.innerText.length : 0
          };
        });
        
        return {
          title: pageTitle || 'LinkedIn Content Requires Authentication',
          markdown: `# LinkedIn Content Not Available

This LinkedIn URL requires authentication to access content: ${url}

## What happened:
LinkedIn is blocking automated access and serving minimal content to bots.

**Page Details:**
- Title: "${pageTitle}"
- Content Length: ${contentLength} characters
- Meta Description: "${availableInfo.description}"

## Why LinkedIn blocks this:
- **Privacy Protection**: User profiles require login to view
- **Terms of Service**: LinkedIn actively prevents automated scraping
- **Bot Detection**: Sophisticated systems detect and block automated access

## Alternatives:
- **LinkedIn API**: Use LinkedIn's official API with proper authentication
- **Manual Access**: Log in to LinkedIn and view the content manually
- **Public Company Pages**: Try LinkedIn company pages which may be publicly accessible
- **Alternative Sources**: Search for the person/company on other professional networks
- **Google Search**: Search for "${url.split('/').pop()}" on Google for alternative sources

## Technical Note:
LinkedIn serves different content to bots vs. authenticated users to protect privacy and comply with their Terms of Service.`,
          url: url,
          extractionType: 'authentication-blocked',
          platform: 'linkedin',
          loginRequired: true,
          debug: {
            contentLength,
            hasLoginIndicators: hasLoginRequirement,
            isEmpty: isEmptyContent,
            pageTitle,
            availableInfo
          }
        };
      }
    }
    
    // Extract the content
    const content = await page.evaluate((extractFullPage, shouldIncludeImages, baseUrl) => {
      let targetElement;
      
      if (extractFullPage) {
        // For full page extraction, use the entire body
        targetElement = document.body;
      } else {
        // Try to find the main content area
        const mainSelectors = [
          'main',
          'article',
          '[role="main"]',
          '.content',
          '.main-content',
          '.post-content',
          '.entry-content',
          '#content',
          '#main'
        ];
        
        targetElement = null;
        
        for (const selector of mainSelectors) {
          targetElement = document.querySelector(selector);
          if (targetElement) break;
        }
        
        // If no main element found, use body
        if (!targetElement) {
          targetElement = document.body;
        }
      }
      
      // Clone the element to avoid modifying the original
      const clonedElement = targetElement.cloneNode(true);
      
      if (extractFullPage) {
        // For full page, only remove scripts and styles (keep everything else)
        const minimalUnwantedSelectors = [
          'script',
          'style',
          'noscript'
        ];
        
        minimalUnwantedSelectors.forEach(selector => {
          const elements = clonedElement.querySelectorAll(selector);
          elements.forEach(el => el.remove());
        });
      } else {
        // For main content extraction, remove unwanted elements as before
        const unwantedSelectors = [
          'script',
          'style',
          'nav',
          'header',
          'footer',
          '.nav',
          '.navbar',
          '.sidebar',
          '.advertisement',
          '.ad',
          '.cookie-banner',
          '.social-share',
          '.comments'
        ];
        
        unwantedSelectors.forEach(selector => {
          const elements = clonedElement.querySelectorAll(selector);
          elements.forEach(el => el.remove());
        });
      }
      
      // Handle images based on user preference
      if (!shouldIncludeImages) {
        // Remove all images if not wanted
        const images = clonedElement.querySelectorAll('img');
        images.forEach(img => img.remove());
      } else {
        // Convert relative image URLs to absolute URLs
        const images = clonedElement.querySelectorAll('img');
        images.forEach(img => {
          if (img.src) {
            try {
              // Convert relative URLs to absolute URLs
              const absoluteUrl = new URL(img.src, baseUrl);
              img.src = absoluteUrl.href;
            } catch (e) {
              // If URL conversion fails, keep original
              console.warn('Failed to convert image URL:', img.src);
            }
          }
          
          // Also handle srcset attribute if present
          if (img.srcset) {
            try {
              const srcsetEntries = img.srcset.split(',').map(entry => {
                const parts = entry.trim().split(' ');
                if (parts.length >= 1) {
                  const absoluteUrl = new URL(parts[0], baseUrl);
                  parts[0] = absoluteUrl.href;
                  return parts.join(' ');
                }
                return entry;
              });
              img.srcset = srcsetEntries.join(', ');
            } catch (e) {
              console.warn('Failed to convert srcset URLs:', img.srcset);
            }
          }
        });
        
        // Also handle background images in style attributes
        const elementsWithBgImages = clonedElement.querySelectorAll('[style*="background-image"]');
        elementsWithBgImages.forEach(el => {
          const style = el.getAttribute('style');
          if (style) {
            const updatedStyle = style.replace(/url\(['"]?([^'")]+)['"]?\)/g, (match, url) => {
              try {
                const absoluteUrl = new URL(url, baseUrl);
                return `url('${absoluteUrl.href}')`;
              } catch (e) {
                return match;
              }
            });
            el.setAttribute('style', updatedStyle);
          }
        });
      }
      
      return {
        title: document.title,
        html: clonedElement.innerHTML,
        url: window.location.href,
        extractionType: extractFullPage ? 'full-page' : 'main-content'
      };
    }, fullPage, includeImages, url);
    
    // Convert HTML to Markdown
    const markdown = turndownService.turndown(content.html);
    
    // Clean up the markdown
    const cleanMarkdown = markdown
      .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
      .replace(/^\s+|\s+$/g, '') // Trim whitespace
      .replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g, '') // Remove nested image links
      .trim();
    
    // Final check for empty content (fallback)
    if (cleanMarkdown.length < 50 && platformInfo.platform !== 'general') {
      return {
        title: content.title || `${platformInfo.platform.charAt(0).toUpperCase() + platformInfo.platform.slice(1)} Content Not Available`,
        markdown: `# Content Not Available

The requested content from ${url} could not be extracted.

## Possible reasons:
- **Authentication Required**: The platform requires login to view content
- **Bot Detection**: The website is blocking automated access
- **JavaScript-heavy Content**: Content loads dynamically and wasn't captured
- **Rate Limiting**: Too many requests to the platform

## What you can do:
- **Manual Access**: Visit the URL directly in your browser
- **Alternative Sources**: Search for the same content on other platforms
- **API Access**: Use official APIs if available
- **Try Later**: Wait and retry the request

## Platform: ${platformInfo.platform}
Original URL: ${url}`,
        url: content.url,
        extractionType: 'empty-content',
        platform: platformInfo.platform,
        isEmpty: true,
        debug: {
          originalMarkdownLength: cleanMarkdown.length,
          titleAvailable: !!content.title
        }
      };
    }
    
    return {
      title: content.title,
      markdown: cleanMarkdown,
      url: content.url,
      extractionType: content.extractionType || (fullPage ? 'full-page' : 'main-content')
    };
    
  } finally {
    await browser.close();
  }
}

/**
 * Suggest alternatives for problematic URLs
 * @param {string} url - Original URL
 * @param {string} platform - Platform name
 * @returns {object} - Suggestions for accessing content
 */
function getAlternativeSuggestions(url, platform) {
  const suggestions = {
    linkedin: {
      apiUrl: 'https://docs.microsoft.com/en-us/linkedin/',
      publicAlternatives: [
        'Try LinkedIn company pages (linkedin.com/company/company-name)',
        'Look for the company\'s official website',
        'Check for press releases or news articles about the content',
        'Use LinkedIn\'s RSS feeds for public posts'
      ],
      tools: [
        'LinkedIn API with proper authentication',
        'Browser automation with logged-in session',
        'Manual copy-paste from authenticated session'
      ]
    },
    facebook: {
      apiUrl: 'https://developers.facebook.com/docs/graph-api/',
      publicAlternatives: [
        'Try Facebook business pages',
        'Look for the organization\'s official website',
        'Check for cross-posted content on other platforms'
      ],
      tools: [
        'Facebook Graph API',
        'Official Facebook business tools'
      ]
    },
    twitter: {
      apiUrl: 'https://developer.twitter.com/en/docs/twitter-api',
      publicAlternatives: [
        'Most Twitter content should be publicly accessible',
        'Try accessing the profile directly'
      ],
      tools: [
        'Twitter API v2',
        'Direct URL access usually works'
      ]
    }
  };
  
  return suggestions[platform] || {
    publicAlternatives: ['Try accessing the content directly in a browser'],
    tools: ['Manual copy-paste']
  };
}

module.exports = {
  searchGoogle,
  extractContent,
  detectPlatform,
  getAlternativeSuggestions
}; 