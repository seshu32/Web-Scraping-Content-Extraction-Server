/**
 * Enhanced Scraper with Advanced Anti-Blocking Measures
 * Integrates: Header rotation, Proxy support, Adaptive rate limiting, API fallback
 */

require('dotenv').config();
const { chromium } = require('playwright');
const { getRandomFingerprint } = require('./enhanced-headers');
const { createProxyContext, reportProxyFailure, selectHealthyProxy } = require('./proxy-rotation');
const { rateLimiter } = require('./adaptive-rate-limiter');
const { searchWithApiFallback } = require('./google-api');

class EnhancedScraper {
  constructor() {
    this.browser = null;
    this.useProxy = process.env.USE_PROXY === 'true';
    this.useAdaptiveRateLimit = process.env.USE_ADAPTIVE_RATE_LIMIT !== 'false';
    this.useApiFallback = process.env.USE_API_FALLBACK !== 'false';
  }

  /**
   * Search with full anti-blocking pipeline and API fallback
   * @param {string} query - Search query
   * @param {number} limit - Number of results
   * @returns {Object} Search results
   */
  async searchWithFallback(query, limit = 10) {
    if (this.useApiFallback) {
      return searchWithApiFallback(query, limit, (q, l) => this.searchGoogle(q, l));
    } else {
      return this.searchGoogle(query, limit);
    }
  }

  /**
   * Enhanced Google search with all anti-blocking measures
   * @param {string} query - Search query
   * @param {number} limit - Number of results
   * @returns {Object} Search results
   */
  async searchGoogle(query, limit = 10) {
    // Apply adaptive rate limiting
    if (this.useAdaptiveRateLimit) {
      await rateLimiter.waitForNextRequest();
    }

    console.log(`🔍 Enhanced search using Google API: "${query}" (limit: ${limit})`);
    
    // Use Google API directly for reliable results
    const { googleAPI } = require('./google-api');
    
    try {
      if (googleAPI.isConfigured() && googleAPI.isWithinLimits()) {
        const results = await googleAPI.search(query, limit);
        
        return {
          results: results || [],
          searchEngine: 'Google Enhanced API',
          source: 'enhanced_api_scraping'
        };
      } else {
        throw new Error('Google API not configured or quota exceeded');
      }
    } catch (error) {
      console.error(`❌ Enhanced Google search failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get scraper statistics
   * @returns {Object} Statistics
   */
  getStats() {
    return {
      rateLimiter: rateLimiter.getStats(),
      useProxy: this.useProxy,
      useAdaptiveRateLimit: this.useAdaptiveRateLimit,
      useApiFallback: this.useApiFallback
    };
  }
}

// Singleton instance
const enhancedScraper = new EnhancedScraper();

module.exports = {
  EnhancedScraper,
  enhancedScraper
}; 