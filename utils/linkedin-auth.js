const { chromium } = require('playwright');

/**
 * LinkedIn authenticated scraper based on legitimate browser automation
 * Similar to https://github.com/joeyism/linkedin_scraper approach
 */

class LinkedInAuthenticatedScraper {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.isLoggedIn = false;
  }

  /**
   * Initialize browser and navigate to LinkedIn
   */
  async initialize() {
    this.browser = await chromium.launch({
      headless: false, // Keep visible for manual login
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });

    this.context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 720 }
    });

    this.page = await this.context.newPage();
  }

  /**
   * Manual login approach - user logs in themselves
   * This is the most ethical approach
   */
  async manualLogin() {
    if (!this.page) await this.initialize();

    console.log('🔗 Opening LinkedIn login page...');
    await this.page.goto('https://www.linkedin.com/login');
    
    console.log('👤 Please log in manually in the browser window');
    console.log('⏳ Waiting for you to complete login...');
    
    // Wait for user to login manually
    await this.page.waitForFunction(() => {
      return window.location.href.includes('linkedin.com/feed') || 
             window.location.href.includes('linkedin.com/in/') ||
             document.querySelector('[data-test-id="feed-container"]');
    }, { timeout: 300000 }); // 5 minute timeout

    this.isLoggedIn = true;
    console.log('✅ Login detected! Ready to scrape.');
  }

  /**
   * Automated login - requires user credentials
   * Similar to the GitHub repository approach
   */
  async automaticLogin(email, password) {
    if (!this.page) await this.initialize();

    console.log('🔗 Navigating to LinkedIn login...');
    await this.page.goto('https://www.linkedin.com/login');

    // Fill login form
    console.log('📝 Filling login credentials...');
    await this.page.fill('#username', email);
    await this.page.fill('#password', password);
    
    // Submit login
    await this.page.click('button[type="submit"]');

    // Wait for login to complete
    try {
      await this.page.waitForFunction(() => {
        return window.location.href.includes('linkedin.com/feed') || 
               window.location.href.includes('linkedin.com/in/') ||
               document.querySelector('[data-test-id="feed-container"]');
      }, { timeout: 30000 });

      this.isLoggedIn = true;
      console.log('✅ Automatic login successful!');
    } catch (error) {
      // Check for CAPTCHA or 2FA
      const hasCaptcha = await this.page.$('iframe[title*="captcha"]');
      const has2FA = await this.page.$('[data-test-id="challenge"]');
      
      if (hasCaptcha || has2FA) {
        console.log('🔐 CAPTCHA or 2FA detected. Please complete manually...');
        await this.page.waitForFunction(() => {
          return window.location.href.includes('linkedin.com/feed') || 
                 window.location.href.includes('linkedin.com/in/');
        }, { timeout: 300000 });
        this.isLoggedIn = true;
      } else {
        throw new Error('Login failed: ' + error.message);
      }
    }
  }

  /**
   * Scrape LinkedIn profile with authenticated session
   */
  async scrapeProfile(profileUrl) {
    if (!this.isLoggedIn) {
      throw new Error('Not logged in. Call manualLogin() or automaticLogin() first.');
    }

    console.log(`📄 Scraping profile: ${profileUrl}`);
    await this.page.goto(profileUrl);

    // Wait for profile content to load
    await this.page.waitForSelector('h1', { timeout: 15000 });

    // Extract profile data
    const profileData = await this.page.evaluate(() => {
      // Extract name
      const nameElement = document.querySelector('h1');
      const name = nameElement ? nameElement.textContent.trim() : '';

      // Extract title
      const titleElement = document.querySelector('[data-generated-suggestion-target] div');
      const title = titleElement ? titleElement.textContent.trim() : '';

      // Extract about section
      const aboutSection = document.querySelector('#about ~ * section');
      let about = '';
      if (aboutSection) {
        const aboutText = aboutSection.querySelector('[data-generated-suggestion-target]');
        about = aboutText ? aboutText.textContent.trim() : '';
      }

      // Extract experience
      const experienceSection = document.querySelector('#experience ~ * section');
      const experiences = [];
      if (experienceSection) {
        const expItems = experienceSection.querySelectorAll('li');
        expItems.forEach(item => {
          const title = item.querySelector('div[data-generated-suggestion-target]');
          const company = item.querySelector('span[aria-hidden="true"]');
          if (title) {
            experiences.push({
              title: title.textContent.trim(),
              company: company ? company.textContent.trim() : ''
            });
          }
        });
      }

      return {
        name,
        title,
        about,
        experiences,
        url: window.location.href,
        scrapedAt: new Date().toISOString()
      };
    });

    return profileData;
  }

  /**
   * Close browser
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.page = null;
      this.isLoggedIn = false;
    }
  }
}

module.exports = { LinkedInAuthenticatedScraper }; 