/**
 * Proxy Rotation and IP Management
 * Support for residential and rotating proxies
 */

require('dotenv').config();

// Example proxy configurations - replace with your actual proxy providers
const proxyPools = {
  residential: [
    {
      server: 'proxy1.example.com:8080',
      username: 'user1',
      password: 'pass1',
      country: 'US',
      type: 'residential'
    },
    {
      server: 'proxy2.example.com:8080', 
      username: 'user2',
      password: 'pass2',
      country: 'UK',
      type: 'residential'
    }
  ],
  datacenter: [
    {
      server: 'dc-proxy1.example.com:3128',
      username: 'dcuser1',
      password: 'dcpass1',
      country: 'DE',
      type: 'datacenter'
    }
  ]
};

// Proxy usage tracking
const proxyUsage = new Map();
const proxyFailures = new Map();
const MAX_FAILURES_PER_PROXY = 3;
const PROXY_COOLDOWN_TIME = 30 * 60 * 1000; // 30 minutes

/**
 * Get environment proxy configuration
 * @returns {Object|null} Proxy configuration from environment variables
 */
function getEnvironmentProxy() {
  const proxyUrl = process.env.PROXY_URL;
  const proxyUsername = process.env.PROXY_USERNAME;
  const proxyPassword = process.env.PROXY_PASSWORD;
  
  if (!proxyUrl) return null;
  
  return {
    server: proxyUrl,
    username: proxyUsername,
    password: proxyPassword,
    type: 'environment',
    country: 'Unknown'
  };
}

/**
 * Select a healthy proxy from the pool
 * @param {string} poolType - 'residential', 'datacenter', or 'any'
 * @returns {Object|null} Selected proxy configuration
 */
function selectHealthyProxy(poolType = 'any') {
  const envProxy = getEnvironmentProxy();
  if (envProxy) {
    console.log('🌐 Using environment proxy configuration');
    return envProxy;
  }
  
  let availableProxies = [];
  
  if (poolType === 'residential' || poolType === 'any') {
    availableProxies = [...availableProxies, ...proxyPools.residential];
  }
  
  if (poolType === 'datacenter' || poolType === 'any') {
    availableProxies = [...availableProxies, ...proxyPools.datacenter];
  }
  
  if (availableProxies.length === 0) {
    console.log('⚠️ No proxies configured, using direct connection');
    return null;
  }
  
  // Filter out failed proxies that are still in cooldown
  const healthyProxies = availableProxies.filter(proxy => {
    const proxyKey = `${proxy.server}:${proxy.username}`;
    const failures = proxyFailures.get(proxyKey) || { count: 0, lastFailure: 0 };
    
    // Check if proxy is in cooldown period
    if (failures.count >= MAX_FAILURES_PER_PROXY) {
      const timeSinceFailure = Date.now() - failures.lastFailure;
      if (timeSinceFailure < PROXY_COOLDOWN_TIME) {
        return false; // Still in cooldown
      } else {
        // Reset failure count after cooldown
        proxyFailures.delete(proxyKey);
        return true;
      }
    }
    
    return true;
  });
  
  if (healthyProxies.length === 0) {
    console.log('❌ All proxies are in failure cooldown, using direct connection');
    return null;
  }
  
  // Select proxy with least recent usage
  const proxyWithUsage = healthyProxies.map(proxy => {
    const proxyKey = `${proxy.server}:${proxy.username}`;
    const lastUsed = proxyUsage.get(proxyKey) || 0;
    return { ...proxy, lastUsed, proxyKey };
  });
  
  // Sort by least recently used
  proxyWithUsage.sort((a, b) => a.lastUsed - b.lastUsed);
  const selectedProxy = proxyWithUsage[0];
  
  // Update usage tracking
  proxyUsage.set(selectedProxy.proxyKey, Date.now());
  
  console.log(`🌐 Selected proxy: ${selectedProxy.server} (${selectedProxy.country}, ${selectedProxy.type})`);
  return selectedProxy;
}

/**
 * Report proxy failure for tracking
 * @param {Object} proxy - Proxy configuration that failed
 * @param {string} error - Error message
 */
function reportProxyFailure(proxy, error) {
  if (!proxy || !proxy.server) return;
  
  const proxyKey = `${proxy.server}:${proxy.username}`;
  const currentFailures = proxyFailures.get(proxyKey) || { count: 0, lastFailure: 0 };
  
  currentFailures.count += 1;
  currentFailures.lastFailure = Date.now();
  
  proxyFailures.set(proxyKey, currentFailures);
  
  console.log(`❌ Proxy failure reported: ${proxy.server} (${currentFailures.count}/${MAX_FAILURES_PER_PROXY}) - ${error}`);
  
  if (currentFailures.count >= MAX_FAILURES_PER_PROXY) {
    console.log(`🚫 Proxy ${proxy.server} temporarily blacklisted for ${PROXY_COOLDOWN_TIME / 60000} minutes`);
  }
}

/**
 * Create browser context with proxy configuration
 * @param {Object} browser - Playwright browser instance
 * @param {Object} proxy - Proxy configuration
 * @returns {Object} Browser context with proxy
 */
async function createProxyContext(browser, proxy = null) {
  if (!proxy) {
    proxy = selectHealthyProxy();
  }
  
  const contextOptions = {
    viewport: { width: 1366 + Math.floor(Math.random() * 100), height: 768 + Math.floor(Math.random() * 100) },
    locale: 'en-US',
    timezoneId: 'America/New_York',
    permissions: []
  };
  
  if (proxy) {
    contextOptions.proxy = {
      server: proxy.server,
      username: proxy.username,
      password: proxy.password
    };
    console.log(`🌐 Browser context created with proxy: ${proxy.server}`);
  } else {
    console.log('🌐 Browser context created with direct connection');
  }
  
  try {
    const context = await browser.newContext(contextOptions);
    return { context, proxy };
  } catch (error) {
    if (proxy) {
      reportProxyFailure(proxy, error.message);
      // Try again without proxy
      console.log('🔄 Retrying without proxy...');
      delete contextOptions.proxy;
      const context = await browser.newContext(contextOptions);
      return { context, proxy: null };
    }
    throw error;
  }
}

/**
 * Test proxy connectivity
 * @param {Object} proxy - Proxy configuration to test
 * @returns {boolean} True if proxy is working
 */
async function testProxy(proxy) {
  const { chromium } = require('playwright');
  
  let browser = null;
  try {
    browser = await chromium.launch({ headless: true });
    
    const context = await browser.newContext({
      proxy: {
        server: proxy.server,
        username: proxy.username,
        password: proxy.password
      }
    });
    
    const page = await context.newPage();
    await page.goto('https://httpbin.org/ip', { timeout: 10000 });
    
    const response = await page.textContent('pre');
    const ipInfo = JSON.parse(response);
    
    console.log(`✅ Proxy ${proxy.server} is working. External IP: ${ipInfo.origin}`);
    return true;
    
  } catch (error) {
    console.log(`❌ Proxy ${proxy.server} failed test: ${error.message}`);
    reportProxyFailure(proxy, error.message);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Get proxy pool statistics
 * @returns {Object} Statistics about proxy usage and health
 */
function getProxyStats() {
  const envProxy = getEnvironmentProxy();
  const totalProxies = proxyPools.residential.length + proxyPools.datacenter.length + (envProxy ? 1 : 0);
  const failedProxies = proxyFailures.size;
  const healthyProxies = totalProxies - failedProxies;
  
  return {
    total: totalProxies,
    healthy: healthyProxies,
    failed: failedProxies,
    usage: Object.fromEntries(proxyUsage),
    failures: Object.fromEntries(proxyFailures)
  };
}

module.exports = {
  selectHealthyProxy,
  reportProxyFailure,
  createProxyContext,
  testProxy,
  getProxyStats,
  getEnvironmentProxy,
  proxyPools
}; 