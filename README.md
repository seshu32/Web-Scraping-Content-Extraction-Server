# Google Search & Content Extraction Server

A Node.js server using Playwright to mimic Google search and extract web content as markdown.

## Features

- **Google Search**: Extract search results from Google with titles, links, snippets, and display URLs
- **Content Extraction**: Extract and convert web page content to markdown format
- **RESTful API**: Simple endpoints for integration
- **Error Handling**: Comprehensive error handling and validation

## Installation

1. Clone or download this project
2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npm run install-browsers
```

## Usage

### Start the server
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### 1. Google Search
**GET** `/search?q=your+query&limit=10`

Extract Google search results for a given query.

**Parameters:**
- `q` (required): Search query
- `limit` (optional): Maximum number of results (default: 10)

**Example:**
```bash
curl "http://localhost:3000/search?q=nodejs+tutorial&limit=5"
```

**Response:**
```json
{
  "query": "nodejs tutorial",
  "results": [
    {
      "title": "Node.js Tutorial - W3Schools",
      "link": "https://www.w3schools.com/nodejs/",
      "snippet": "Node.js is a runtime environment for executing JavaScript code server-side.",
      "displayUrl": "https://www.w3schools.com › nodejs",
      "position": 1
    }
  ],
  "count": 5
}
```

### 2. Content Extraction
**GET** `/extract?url=https://example.com&full=true&images=false`

Extract content from a URL and convert it to markdown.

**Parameters:**
- `url` (required): URL to extract content from
- `full` (optional): Set to `true` or `1` to extract complete page content including headers, navigation, sidebars, etc. Default extracts only main content.
- `images` (optional): Set to `false` or `0` to exclude images from the output. Default includes images with absolute URLs.

**Examples:**

Extract main content only (default with images):
```bash
curl "http://localhost:3000/extract?url=https://example.com"
```

Extract complete page content:
```bash
curl "http://localhost:3000/extract?url=https://example.com&full=true"
```

Extract content without images:
```bash
curl "http://localhost:3000/extract?url=https://example.com&images=false"
```

Extract full page without images:
```bash
curl "http://localhost:3000/extract?url=https://example.com&full=true&images=false"
```

**Response:**
```json
{
  "url": "https://example.com",
  "content": {
    "title": "Example Domain",
    "markdown": "# Example Domain\n\nThis domain is for use in illustrative examples...",
    "url": "https://example.com"
  },
  "extractedAt": "2024-01-01T12:00:00.000Z"
}
```

### 3. Health Check
**GET** `/`

Returns server status and available endpoints.

## Error Responses

All endpoints return appropriate HTTP status codes:

- `400`: Bad Request (missing or invalid parameters)
- `422`: Unprocessable Entity (authentication required, e.g., LinkedIn)
- `500`: Internal Server Error (scraping failed, network issues, etc.)

### Standard Error Response:
```json
{
  "error": "Query parameter 'q' is required"
}
```

### LinkedIn/Social Media Authentication Required:
```json
{
  "url": "https://linkedin.com/in/username",
  "content": {
    "title": "LinkedIn Content Requires Authentication",
    "markdown": "# LinkedIn Content Not Available\n\n...",
    "platform": "linkedin",
    "loginRequired": true
  },
  "suggestions": {
    "publicAlternatives": [
      "Try LinkedIn company pages",
      "Look for the company's official website"
    ],
    "tools": [
      "LinkedIn API with proper authentication"
    ]
  },
  "message": "Content extraction blocked: linkedin requires authentication"
}
```

## Configuration

### Environment Variables
- `PORT`: Server port (default: 3000)

### Browser Configuration
The scraper uses Chromium in headless mode with the following settings:
- No sandbox mode for better compatibility
- Custom user agent to avoid bot detection
- Network idle wait for content extraction

## Rate Limiting & Best Practices

- Be respectful of target websites' resources
- Consider implementing rate limiting for production use
- Monitor for IP blocking from Google
- Use appropriate delays between requests if needed

## Dependencies

- **Express**: Web server framework
- **Playwright**: Browser automation
- **Turndown**: HTML to Markdown conversion
- **CORS**: Cross-origin resource sharing
- **Helmet**: Security headers

## License

MIT License 