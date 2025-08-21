const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/json-proxy', async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    // Validate URL
    const urlObj = new URL(url);
    
    // Allow specific domains for security
    const allowedDomains = [
      'drive.google.com',
      'docs.google.com',
      'supabase.co',
      'storage.googleapis.com',
      'amazonaws.com',
      'cloudfront.net',
      'jsonplaceholder.typicode.com'
    ];
    
    const isAllowedDomain = allowedDomains.some(domain => 
      urlObj.hostname.includes(domain)
    );
    
    if (!isAllowedDomain) {
      return res.status(403).json({ 
        error: 'Domain not allowed for security reasons',
        allowedDomains 
      });
    }

    console.log('Proxying request to:', url);

    // Fetch the file with appropriate headers
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'TaskNova-JSON-Proxy/1.0',
        'Accept': 'application/json,text/plain,*/*',
      },
      // Don't follow redirects for Google Drive
      redirect: 'manual'
    });

    // Handle redirects manually for Google Drive
    if (response.status === 302 || response.status === 303) {
      const location = response.headers.get('location');
      if (location) {
        console.log('Following redirect to:', location);
        const redirectResponse = await fetch(location, {
          method: 'GET',
          headers: {
            'User-Agent': 'TaskNova-JSON-Proxy/1.0',
            'Accept': 'application/json,text/plain,*/*',
          }
        });
        
        if (!redirectResponse.ok) {
          return res.status(redirectResponse.status).json({ 
            error: `Failed to fetch JSON: ${redirectResponse.status} ${redirectResponse.statusText}` 
          });
        }
        
        const content = await redirectResponse.text();
        
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Content-Type', 'application/json');
        
        return res.status(200).send(content);
      }
    }

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Failed to fetch JSON: ${response.status} ${response.statusText}` 
      });
    }

    const content = await response.text();
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(200).send(content);

  } catch (error) {
    console.error('JSON proxy error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`JSON Proxy server running on http://localhost:${PORT}`);
}); 