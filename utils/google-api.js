/**
 * Google Custom Search API Integration
 * Official API as reliable fallback to avoid blocks
 */

require('dotenv').config();
const fetch = require('node-fetch');

class GoogleSearchAPI {
  constructor() {
    this.apiKey = process.env.GOOGLE_API_KEY;
    this.searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
    this.baseUrl = 'https://www.googleapis.com/customsearch/v1';
    this.requestCount = 0;
    this.dailyLimit = 100; // Free tier limit
    this.lastResetDate = new Date().toDateString();
  }

  /**
   * Check if API credentials are configured
   * @returns {boolean} True if API is configured
   */
  isConfigured() {
    return !!(this.apiKey && this.searchEngineId);
  }

  /**
   * Check if we're within daily API limits
   * @returns {boolean} True if within limits
   */
  isWithinLimits() {
    const today = new Date().toDateString();
    
    // Reset counter if it's a new day
    if (this.lastResetDate !== today) {
      this.requestCount = 0;
      this.lastResetDate = today;
    }
    
    return this.requestCount < this.dailyLimit;
  }

  /**
   * Search using Google Custom Search API
   * @param {string} query - Search query
   * @param {number} limit - Number of results (max 10 per request)
   * @param {Object} options - Additional search options
   * @returns {Array} Array of search results
   */
  async search(query, limit = 10, options = {}) {
    if (!this.isConfigured()) {
      throw new Error('Google Custom Search API not configured. Set GOOGLE_API_KEY and GOOGLE_SEARCH_ENGINE_ID environment variables.');
    }

    if (!this.isWithinLimits()) {
      throw new Error(`Daily API limit of ${this.dailyLimit} requests reached. Resets at midnight.`);
    }

    // Google Custom Search API has a max of 10 results per request
    const num = Math.min(limit, 10);
    
    const params = new URLSearchParams({
      key: this.apiKey,
      cx: this.searchEngineId,
      q: query,
      num: num.toString(),
      ...options
    });

    const url = `${this.baseUrl}?${params}`;
    
    console.log(`🔍 Google API search: "${query}" (${num} results)`);
    
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; GoogleSearchAPI/1.0)',
          'Accept': 'application/json'
        },
        timeout: 10000
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      this.requestCount++;
      
      // Check for API errors
      if (data.error) {
        throw new Error(`Google API Error: ${data.error.message} (Code: ${data.error.code})`);
      }

      const results = this.formatResults(data);
      
      console.log(`✅ Google API returned ${results.length} results`);
      console.log(`📊 API usage: ${this.requestCount}/${this.dailyLimit} requests today`);
      
      return results;

    } catch (error) {
      console.error(`❌ Google API search failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Format API results to match scraper format
   * @param {Object} apiResponse - Raw API response
   * @returns {Array} Formatted results
   */
  formatResults(apiResponse) {
    if (!apiResponse.items) {
      return [];
    }

    return apiResponse.items.map((item, index) => ({
      title: item.title || '',
      url: item.link || '',
      snippet: item.snippet || '',
      displayLink: item.displayLink || '',
      position: index + 1,
      source: 'Google API',
      // Additional metadata from API
      htmlTitle: item.htmlTitle,
      htmlSnippet: item.htmlSnippet,
      formattedUrl: item.formattedUrl,
      pagemap: item.pagemap || {}
    }));
  }

  /**
   * Search with image results
   * @param {string} query - Search query
   * @param {number} limit - Number of results
   * @returns {Array} Array of image results
   */
  async searchImages(query, limit = 10) {
    return this.search(query, limit, {
      searchType: 'image',
      safe: 'active'
    });
  }

  /**
   * Search news results
   * @param {string} query - Search query
   * @param {number} limit - Number of results
   * @returns {Array} Array of news results
   */
  async searchNews(query, limit = 10) {
    return this.search(query, limit, {
      tbm: 'nws',
      sort: 'date'
    });
  }

  /**
   * Get API usage statistics
   * @returns {Object} Usage statistics
   */
  getUsageStats() {
    const remainingRequests = this.dailyLimit - this.requestCount;
    const usagePercentage = Math.round((this.requestCount / this.dailyLimit) * 100);
    
    return {
      requestsUsed: this.requestCount,
      requestsRemaining: remainingRequests,
      dailyLimit: this.dailyLimit,
      usagePercentage,
      resetDate: this.lastResetDate,
      isConfigured: this.isConfigured()
    };
  }

  /**
   * Test API connectivity and quota
   * @returns {Object} Test results
   */
  async testAPI() {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'API not configured',
        configured: false
      };
    }

    try {
      const results = await this.search('test', 1);
      
      return {
        success: true,
        configured: true,
        resultsReturned: results.length,
        usage: this.getUsageStats()
      };
    } catch (error) {
      return {
        success: false,
        configured: true,
        error: error.message,
        usage: this.getUsageStats()
      };
    }
  }
}

// Singleton instance
const googleAPI = new GoogleSearchAPI();

/**
 * Fallback search function that tries API if scraping fails
 * @param {string} query - Search query
 * @param {number} limit - Number of results
 * @param {Function} scrapingFunction - Primary scraping function to try first
 * @returns {Array} Search results
 */
async function searchWithApiFallback(query, limit, scrapingFunction) {
  let results = [];
  let searchEngine = 'Unknown';
  let error = null;

  // Try scraping first
  try {
    console.log('🔧 Attempting scraping method...');
    const scrapingResult = await scrapingFunction(query, limit);
    results = scrapingResult.results || scrapingResult;
    searchEngine = scrapingResult.searchEngine || 'Scraping';
    
    if (results && results.length > 0) {
      console.log(`✅ Scraping successful: ${results.length} results`);
      return { results, searchEngine, source: 'scraping' };
    }
  } catch (scrapingError) {
    console.log(`❌ Scraping failed: ${scrapingError.message}`);
    error = scrapingError;
  }

  // Fallback to API if scraping failed or no results
  if (googleAPI.isConfigured() && googleAPI.isWithinLimits()) {
    try {
      console.log('🔄 Falling back to Google Custom Search API...');
      results = await googleAPI.search(query, limit);
      searchEngine = 'Google API';
      
      if (results && results.length > 0) {
        console.log(`✅ API fallback successful: ${results.length} results`);
        return { results, searchEngine, source: 'api' };
      }
    } catch (apiError) {
      console.log(`❌ API fallback failed: ${apiError.message}`);
      error = apiError;
    }
  } else if (!googleAPI.isConfigured()) {
    console.log('⚠️ Google API not configured for fallback');
  } else {
    console.log('⚠️ Google API daily limit reached');
  }

  // If all methods failed, throw the original error
  throw new Error(`All search methods failed. Last error: ${error?.message || 'Unknown error'}`);
}

module.exports = {
  GoogleSearchAPI,
  googleAPI,
  searchWithApiFallback
}; 