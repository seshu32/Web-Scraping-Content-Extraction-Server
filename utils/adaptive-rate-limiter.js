/**
 * Adaptive Rate Limiter with Human Behavior Simulation
 * Intelligent delays based on success patterns and human-like behavior
 */

class AdaptiveRateLimiter {
  constructor() {
    this.requests = [];
    this.successHistory = [];
    this.failureHistory = [];
    this.currentDelay = 2000; // Start with 2 seconds
    this.minDelay = 2000;
    this.maxDelay = 60000; // 1 minute max
    this.maxRequestsPerMinute = 3;
    this.adaptiveEnabled = true;
    
    // Human behavior patterns
    this.humanPatterns = {
      workingHours: { start: 9, end: 17 }, // 9 AM to 5 PM
      lunchBreak: { start: 12, end: 13 },  // 12 PM to 1 PM
      weekendSlowdown: 0.7, // 70% of normal speed on weekends
      nightSlowdown: 0.5,   // 50% of normal speed at night
    };
    
    // Circadian rhythm simulation
    this.circadianMultipliers = {
      0: 0.3,  // Midnight - 3AM: Very slow
      3: 0.2,  // 3AM - 6AM: Slowest
      6: 0.5,  // 6AM - 9AM: Waking up
      9: 1.0,  // 9AM - 12PM: Peak activity
      12: 0.8, // 12PM - 3PM: Post-lunch dip
      15: 1.0, // 3PM - 6PM: Afternoon peak
      18: 0.9, // 6PM - 9PM: Evening
      21: 0.6  // 9PM - 12AM: Wind down
    };
  }

  /**
   * Check if a request can be made based on rate limiting
   * @returns {boolean} True if request can be made
   */
  canMakeRequest() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Remove old requests
    this.requests = this.requests.filter(timestamp => timestamp > oneMinuteAgo);
    
    return this.requests.length < this.maxRequestsPerMinute;
  }

  /**
   * Calculate human-like delay based on time of day and patterns
   * @returns {number} Delay in milliseconds
   */
  calculateHumanDelay() {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Base delay from circadian rhythm
    const circadianHour = Math.floor(hour / 3) * 3; // Round to nearest 3-hour block
    const circadianMultiplier = this.circadianMultipliers[circadianHour] || 1.0;
    
    let delay = this.currentDelay * circadianMultiplier;
    
    // Weekend slowdown
    if (isWeekend) {
      delay *= (1 / this.humanPatterns.weekendSlowdown);
    }
    
    // Working hours adjustment
    const isWorkingHours = hour >= this.humanPatterns.workingHours.start && 
                          hour < this.humanPatterns.workingHours.end;
    const isLunchBreak = hour >= this.humanPatterns.lunchBreak.start && 
                        hour < this.humanPatterns.lunchBreak.end;
    
    if (!isWorkingHours && !isWeekend) {
      delay *= 1.5; // Slower outside working hours on weekdays
    }
    
    if (isLunchBreak) {
      delay *= 2.0; // Much slower during lunch
    }
    
    // Add random human-like variation (±30%)
    const variation = 0.3;
    const randomFactor = 1 + (Math.random() - 0.5) * 2 * variation;
    delay *= randomFactor;
    
    // Ensure within bounds
    delay = Math.max(this.minDelay, Math.min(this.maxDelay, delay));
    
    console.log(`🕐 Human delay calculation: ${Math.round(delay/1000)}s (hour: ${hour}, weekend: ${isWeekend}, circadian: ${circadianMultiplier})`);
    
    return delay;
  }

  /**
   * Add randomized micro-delays for human behavior
   * @returns {number} Additional delay in milliseconds
   */
  addMicroDelays() {
    const microDelays = [];
    
    // Random pauses (thinking, reading, getting distracted)
    if (Math.random() < 0.3) { // 30% chance
      microDelays.push(Math.random() * 5000 + 2000); // 2-7 seconds
      console.log('🤔 Simulating thinking pause...');
    }
    
    // Coffee break simulation
    if (Math.random() < 0.05) { // 5% chance
      microDelays.push(Math.random() * 30000 + 60000); // 1-1.5 minutes
      console.log('☕ Simulating coffee break...');
    }
    
    // Phone distraction
    if (Math.random() < 0.1) { // 10% chance
      microDelays.push(Math.random() * 15000 + 10000); // 10-25 seconds
      console.log('📱 Simulating phone distraction...');
    }
    
    return microDelays.reduce((sum, delay) => sum + delay, 0);
  }

  /**
   * Adaptive delay adjustment based on success/failure patterns
   */
  adaptDelayBasedOnHistory() {
    if (!this.adaptiveEnabled) return;
    
    const recentHistory = 10; // Look at last 10 requests
    const recentSuccess = this.successHistory.slice(-recentHistory);
    const recentFailures = this.failureHistory.slice(-recentHistory);
    
    const successRate = recentSuccess.length / (recentSuccess.length + recentFailures.length);
    
    if (successRate < 0.7) { // Less than 70% success rate
      this.currentDelay = Math.min(this.maxDelay, this.currentDelay * 1.5);
      console.log(`📈 Increasing delay due to failures: ${Math.round(this.currentDelay/1000)}s`);
    } else if (successRate > 0.9 && this.currentDelay > this.minDelay) { // More than 90% success
      this.currentDelay = Math.max(this.minDelay, this.currentDelay * 0.8);
      console.log(`📉 Decreasing delay due to success: ${Math.round(this.currentDelay/1000)}s`);
    }
  }

  /**
   * Get the total delay before next request
   * @returns {number} Total delay in milliseconds
   */
  async getNextDelay() {
    const baseDelay = this.calculateHumanDelay();
    const microDelays = this.addMicroDelays();
    const totalDelay = baseDelay + microDelays;
    
    console.log(`⏳ Total delay: ${Math.round(totalDelay/1000)}s (base: ${Math.round(baseDelay/1000)}s, micro: ${Math.round(microDelays/1000)}s)`);
    
    return totalDelay;
  }

  /**
   * Wait for the calculated delay
   */
  async waitForNextRequest() {
    if (!this.canMakeRequest()) {
      const waitTime = 60000; // Wait full minute if rate limited
      console.log(`🚫 Rate limit exceeded. Waiting ${waitTime/1000}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return;
    }
    
    const delay = await this.getNextDelay();
    
    if (delay > 0) {
      console.log(`⏱️ Waiting ${Math.round(delay/1000)}s before next request...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    // Record this request
    this.requests.push(Date.now());
    this.adaptDelayBasedOnHistory();
  }

  /**
   * Record a successful request
   */
  recordSuccess() {
    this.successHistory.push(Date.now());
    // Keep only recent history
    if (this.successHistory.length > 50) {
      this.successHistory = this.successHistory.slice(-25);
    }
  }

  /**
   * Record a failed request
   * @param {string} reason - Reason for failure
   */
  recordFailure(reason = 'unknown') {
    this.failureHistory.push({ timestamp: Date.now(), reason });
    console.log(`❌ Request failure recorded: ${reason}`);
    
    // Keep only recent history
    if (this.failureHistory.length > 50) {
      this.failureHistory = this.failureHistory.slice(-25);
    }
  }

  /**
   * Get statistics about rate limiting and success patterns
   * @returns {Object} Statistics object
   */
  getStats() {
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    
    const recentSuccesses = this.successHistory.filter(timestamp => timestamp > oneHourAgo);
    const recentFailures = this.failureHistory.filter(entry => entry.timestamp > oneHourAgo);
    
    const successRate = recentSuccesses.length / (recentSuccesses.length + recentFailures.length) || 0;
    
    return {
      currentDelay: this.currentDelay,
      successRate: Math.round(successRate * 100),
      recentSuccesses: recentSuccesses.length,
      recentFailures: recentFailures.length,
      requestsInLastMinute: this.requests.length,
      adaptiveEnabled: this.adaptiveEnabled
    };
  }

  /**
   * Reset the rate limiter
   */
  reset() {
    this.requests = [];
    this.successHistory = [];
    this.failureHistory = [];
    this.currentDelay = this.minDelay;
    console.log('🔄 Rate limiter reset');
  }
}

// Singleton instance
const globalRateLimiter = new AdaptiveRateLimiter();

module.exports = {
  AdaptiveRateLimiter,
  rateLimiter: globalRateLimiter
}; 