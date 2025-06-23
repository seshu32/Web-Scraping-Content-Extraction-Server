# LinkedIn OAuth Integration (Legitimate Alternative)

Instead of automating login, use LinkedIn's official OAuth flow for legitimate access.

## 1. Register Your Application

1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Create a new app
3. Get your `Client ID` and `Client Secret`
4. Set redirect URLs

## 2. OAuth Flow Implementation

### Step 1: Redirect User to LinkedIn
```javascript
const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
  `response_type=code&` +
  `client_id=${CLIENT_ID}&` +
  `redirect_uri=${REDIRECT_URI}&` +
  `scope=r_liteprofile%20r_emailaddress`;

// Redirect user to authUrl
```

### Step 2: Handle Callback
```javascript
app.get('/auth/linkedin/callback', async (req, res) => {
  const { code } = req.query;
  
  // Exchange code for access token
  const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI
    })
  });
  
  const tokens = await tokenResponse.json();
  // Store tokens securely
});
```

### Step 3: Make Authenticated Requests
```javascript
const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
  headers: {
    'Authorization': `Bearer ${access_token}`
  }
});
```

## 3. Available LinkedIn APIs

### Profile API
- Get user's basic profile information
- Access professional experience
- Retrieve education history

### Company API
- Get company information
- Access company posts
- Retrieve company statistics

### Sharing API
- Post content to LinkedIn
- Share articles and updates
- Manage company page content

## 4. Scopes and Permissions

Common OAuth scopes:
- `r_liteprofile`: Basic profile information
- `r_emailaddress`: Email address
- `w_member_social`: Post content
- `r_organization_social`: Read company content

## 5. Rate Limits and Best Practices

- **Respect Rate Limits**: LinkedIn has strict API limits
- **Cache Data**: Store frequently accessed data locally
- **User Consent**: Always get explicit user permission
- **Secure Storage**: Store tokens securely with encryption

## Benefits of Official API vs. Scraping

✅ **Reliable**: Stable, documented endpoints
✅ **Legal**: Complies with Terms of Service  
✅ **Secure**: Proper authentication and authorization
✅ **Supported**: Official support and documentation
✅ **Scalable**: Designed for application use

## Example: Simple LinkedIn Profile Fetcher

```javascript
class LinkedInAPI {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseURL = 'https://api.linkedin.com/v2';
  }
  
  async getProfile() {
    const response = await fetch(`${this.baseURL}/me`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status}`);
    }
    
    return response.json();
  }
  
  async getCompanyInfo(companyId) {
    const response = await fetch(`${this.baseURL}/companies/${companyId}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });
    
    return response.json();
  }
}
```

## Resources

- [LinkedIn API Documentation](https://docs.microsoft.com/en-us/linkedin/)
- [OAuth 2.0 Guide](https://docs.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow)
- [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
- [API Rate Limits](https://docs.microsoft.com/en-us/linkedin/shared/api-guide/concepts/rate-limits) 