const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { searchGoogle, extractContent, detectPlatform, getAlternativeSuggestions } = require('./utils/scraper');
const { LinkedInAuthenticatedScraper } = require('./utils/linkedin-auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Web Scraping & Content Extraction API',
      version: '1.0.0',
      description: `
A powerful Express.js server that provides Google search and web content extraction capabilities through automated browser interactions. Built with Playwright for reliable web scraping and content parsing.

## 🚀 Features

### 🔍 Google Search API
- Automated Google search with anti-bot detection evasion
- Stealth browsing techniques to bypass Google's blocking mechanisms
- Extracts search results with titles, links, snippets, and positions
- Configurable result limits and robust error handling

### 📄 Content Extraction
- Extract clean content from any web URL
- Convert HTML to readable Markdown format
- Support for full-page or main-content extraction
- Optional image inclusion/exclusion
- Smart platform detection (LinkedIn, Facebook, Twitter, etc.)

### 👔 LinkedIn Authenticated Scraping
- Automated LinkedIn profile scraping with authentication
- Support for both manual and automatic login methods
- Extract comprehensive profile data while respecting privacy
- Built-in warnings and ethical considerations

## 🛡️ Anti-Detection Features
- Human-like browsing patterns with random delays
- Realistic user agents and browser fingerprinting
- Smart cookie handling and stealth navigation
- Robust blocking detection and alternative suggestions
      `,
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server'
      }
    ],
    tags: [
      {
        name: 'Search',
        description: 'Google search operations'
      },
      {
        name: 'Content Extraction', 
        description: 'Web content extraction and conversion'
      },
      {
        name: 'LinkedIn',
        description: 'LinkedIn authenticated scraping'
      },
      {
        name: 'Health',
        description: 'API health and status'
      }
    ]
  },
  apis: ['./server.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Web Scraping API Documentation',
  swaggerOptions: {
    theme: 'dark',
    tryItOutEnabled: true
  }
}));

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * @swagger
 * /:
 *   get:
 *     tags: [Health]
 *     summary: API Health Check and Documentation
 *     description: Returns API status and available endpoints information
 *     responses:
 *       200:
 *         description: API is healthy and running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Google Search & Content Extraction Server
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     search:
 *                       type: string
 *                       example: /search?q=your+query&limit=10
 *                     extract:
 *                       type: string
 *                       example: /extract?url=https://example.com
 *                     extract-full:
 *                       type: string
 *                       example: /extract?url=https://example.com&full=true
 *                     extract-no-images:
 *                       type: string
 *                       example: /extract?url=https://example.com&images=false
 *                     linkedin-auth:
 *                       type: string
 *                       example: POST /linkedin/scrape (with credentials in body)
 *                 documentation:
 *                   type: string
 *                   example: /api-docs
 */
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
    },
    documentation: '/api-docs'
  });
});

/**
 * @swagger
 * /search:
 *   get:
 *     tags: [Search]
 *     summary: Perform Google Search
 *     description: |
 *       Executes an automated Google search with anti-bot detection evasion.
 *       Returns structured search results with titles, links, snippets, and positions.
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query string
 *         example: "web scraping tools"
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Maximum number of results to return
 *         example: 10
 *     responses:
 *       200:
 *         description: Search completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 query:
 *                   type: string
 *                   example: "web scraping tools"
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         example: "Best Web Scraping Tools 2024"
 *                       link:
 *                         type: string
 *                         format: uri
 *                         example: "https://example.com/web-scraping-tools"
 *                       snippet:
 *                         type: string
 *                         example: "Comprehensive guide to web scraping tools..."
 *                       displayUrl:
 *                         type: string
 *                         example: "https://example.com › tools"
 *                       position:
 *                         type: integer
 *                         example: 1
 *                 count:
 *                   type: integer
 *                   example: 10
 *       400:
 *         description: Missing or invalid query parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Query parameter "q" is required
 *       500:
 *         description: Search operation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to perform search
 *                 message:
 *                   type: string
 *                   example: Google is blocking requests. Please try again later.
 */
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

/**
 * @swagger
 * /extract:
 *   get:
 *     tags: [Content Extraction]
 *     summary: Extract Content from URL
 *     description: |
 *       Extracts clean content from any web URL and converts it to readable Markdown format.
 *       Supports full-page extraction, main content extraction, and image handling options.
 *       Includes smart platform detection for social media sites.
 *     parameters:
 *       - in: query
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *           format: uri
 *         description: URL to extract content from
 *         example: "https://example.com/article"
 *       - in: query
 *         name: full
 *         required: false
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Extract full page content instead of main content only
 *         example: true
 *       - in: query
 *         name: images
 *         required: false
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Include images in the extracted content
 *         example: false
 *     responses:
 *       200:
 *         description: Content extracted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   format: uri
 *                   example: "https://example.com/article"
 *                 content:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: "Example Article Title"
 *                     markdown:
 *                       type: string
 *                       example: "# Example Article Title\n\nThis is the article content..."
 *                     extractionType:
 *                       type: string
 *                       enum: [main-content, full-page]
 *                       example: "main-content"
 *                     platform:
 *                       type: string
 *                       example: "general"
 *                 extractedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-01T00:00:00.000Z"
 *       400:
 *         description: Missing or invalid URL parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: URL parameter is required
 *       422:
 *         description: Content extraction blocked (e.g., authentication required)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                 content:
 *                   type: object
 *                 extractedAt:
 *                   type: string
 *                 suggestions:
 *                   type: array
 *                   items:
 *                     type: string
 *                 message:
 *                   type: string
 *                   example: "Content extraction blocked: LinkedIn requires authentication"
 *       500:
 *         description: Content extraction failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to extract content
 *                 message:
 *                   type: string
 */
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

/**
 * @swagger
 * /linkedin/scrape:
 *   post:
 *     tags: [LinkedIn]
 *     summary: LinkedIn Authenticated Scraping
 *     description: |
 *       Performs authenticated LinkedIn profile scraping with support for both automatic and manual login methods.
 *       **Warning:** The profile owner may see that you viewed their profile.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *                 description: LinkedIn profile URL to scrape
 *                 example: "https://www.linkedin.com/in/example-profile"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: LinkedIn email (required for automatic login)
 *                 example: "your-email@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: LinkedIn password (required for automatic login)
 *                 example: "your-password"
 *               manual:
 *                 type: boolean
 *                 default: false
 *                 description: Use manual login mode (browser will open for user login)
 *                 example: true
 *     responses:
 *       200:
 *         description: LinkedIn profile scraped successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   description: Extracted LinkedIn profile data
 *                 method:
 *                   type: string
 *                   enum: [manual-login, automatic-login]
 *                   example: "automatic-login"
 *                 warning:
 *                   type: string
 *                   example: "The profile owner may see that you viewed their profile"
 *                 extractedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-01T00:00:00.000Z"
 *       400:
 *         description: Missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: LinkedIn URL is required
 *       500:
 *         description: LinkedIn scraping failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: LinkedIn scraping failed
 *                 message:
 *                   type: string
 *                 suggestion:
 *                   type: string
 *                   example: Try manual login mode or check credentials
 */
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