const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { searchGoogle, extractContent, detectPlatform, getAlternativeSuggestions } = require('./utils/scraper');
const { LinkedInAuthenticatedScraper } = require('./utils/linkedin-auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Google Search & Content Extraction Server',
    endpoints: {
      search: '/search?q=your+query&limit=10',
      extract: '/extract?url=https://example.com',
      'extract-full': '/extract?url=https://example.com&full=true',
      'extract-no-images': '/extract?url=https://example.com&images=false',
      'linkedin-auth': 'POST /linkedin/scrape (with credentials in body)'
    }
  });
});

// Google search endpoint
app.get('/search', async (req, res) => {
  try {
    const { q: query, limit = 10 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        error: 'Query parameter "q" is required'
      });
    }

    console.log(`Searching for: ${query}`);
    const results = await searchGoogle(query, parseInt(limit));
    
    res.json({
      query,
      results,
      count: results.length
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Failed to perform search',
      message: error.message
    });
  }
});

// Content extraction endpoint
app.get('/extract', async (req, res) => {
  try {
    const { url, full, images } = req.query;
    
    if (!url) {
      return res.status(400).json({
        error: 'URL parameter is required'
      });
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return res.status(400).json({
        error: 'Invalid URL format'
      });
    }

    // Parse parameters
    const fullPage = full === 'true' || full === '1';
    const includeImages = images !== 'false' && images !== '0'; // Default to true
    const extractionType = fullPage ? 'full page' : 'main content';
    const imageHandling = includeImages ? 'with images' : 'without images';

    console.log(`Extracting ${extractionType} ${imageHandling} from: ${url}`);
    const content = await extractContent(url, fullPage, includeImages);
    
    // Check if this is a platform-specific response (like LinkedIn auth required)
    if (content.platform && (content.loginRequired || content.isEmpty)) {
      const suggestions = getAlternativeSuggestions(url, content.platform);
      
      let statusCode = 422; // Unprocessable Entity
      let message = `Content extraction blocked: ${content.platform} requires authentication`;
      
      if (content.isEmpty) {
        message = `Content extraction failed: ${content.platform} returned empty content (likely blocked)`;
      }
      
      res.status(statusCode).json({
        url,
        content,
        extractedAt: new Date().toISOString(),
        suggestions,
        message
      });
    } else {
      res.json({
        url,
        content,
        extractedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Extraction error:', error);
    res.status(500).json({
      error: 'Failed to extract content',
      message: error.message
    });
  }
});

// LinkedIn authenticated scraping endpoint (similar to GitHub repo approach)
app.post('/linkedin/scrape', async (req, res) => {
  let scraper = null;
  
  try {
    const { url, email, password, manual = false } = req.body;
    
    if (!url) {
      return res.status(400).json({
        error: 'LinkedIn URL is required'
      });
    }

    if (!manual && (!email || !password)) {
      return res.status(400).json({
        error: 'Email and password required for automatic login, or set manual=true'
      });
    }

    console.log(`🔗 LinkedIn authenticated scraping: ${url}`);
    
    scraper = new LinkedInAuthenticatedScraper();
    
    // Login based on approach (manual vs automatic)
    if (manual) {
      console.log('👤 Manual login mode - browser will open for user login');
      await scraper.manualLogin();
    } else {
      console.log('🤖 Automatic login mode');
      await scraper.automaticLogin(email, password);
    }
    
    // Scrape the profile
    const profileData = await scraper.scrapeProfile(url);
    
    res.json({
      success: true,
      data: profileData,
      method: manual ? 'manual-login' : 'automatic-login',
      warning: 'The profile owner may see that you viewed their profile',
      extractedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('LinkedIn scraping error:', error);
    res.status(500).json({
      error: 'LinkedIn scraping failed',
      message: error.message,
      suggestion: 'Try manual login mode or check credentials'
    });
  } finally {
    if (scraper) {
      await scraper.close();
    }
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log(`  GET /search?q=your+query`);
  console.log(`  GET /extract?url=https://example.com`);
});

module.exports = app; 