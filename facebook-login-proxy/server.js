const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Define constants
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

// Helper function to format cookies
function formatCookiesJson(cookies) {
  const result = [];
  for (const [key, value] of Object.entries(cookies)) {
    if (key && value) { // Ensure key and value exist
      result.push({
        key,
        value,
        domain: 'facebook.com',
        path: '/',
        hostOnly: false,
        creation: new Date().toISOString(),
        lastAccessed: new Date().toISOString()
      });
    }
  }
  return result;
}

function formatCookiesString(cookies) {
  return Object.entries(cookies)
    .filter(([key, value]) => key && value) // Filter out entries with empty keys or values
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');
}

// Parse cookies from Set-Cookie header
function parseCookies(cookieHeaders) {
  const cookies = {};
  if (!cookieHeaders) return cookies;
  
  const cookieArray = Array.isArray(cookieHeaders) ? cookieHeaders : [cookieHeaders];
  
  cookieArray.forEach(cookieStr => {
    const [keyValueStr] = cookieStr.split(';');
    if (keyValueStr) {
      const [key, value] = keyValueStr.split('=');
      if (key && value) {
        cookies[key.trim()] = value.trim();
      }
    }
  });
  
  return cookies;
}

// Extract all form inputs from HTML
function extractFormInputs(html) {
  const inputs = {};
  const inputRegex = /<input[^>]*name="([^"]*)"[^>]*value="([^"]*)"[^>]*>/g;
  let match;
  
  while ((match = inputRegex.exec(html)) !== null) {
    const name = match[1];
    const value = match[2];
    if (name) {
      inputs[name] = value;
    }
  }
  
  return inputs;
}

// Handle login
app.post('/facebook/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Custom agent for more reliable connections
    const agent = new https.Agent({ 
      keepAlive: true,
      rejectUnauthorized: false
    });

    // Step 1: Get initial page and cookies
    console.log('Fetching initial Facebook page...');
    const initialResponse = await axios.get('https://m.facebook.com/', {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      },
      httpsAgent: agent
    });
    
    // Parse initial cookies
    const initialCookies = parseCookies(initialResponse.headers['set-cookie']);
    console.log('Initial cookies obtained:', Object.keys(initialCookies));
    
    // Step 2: Get login page to extract form fields
    console.log('Fetching login page...');
    const loginPageResponse = await axios.get('https://m.facebook.com/login/?next&ref=dbl&fl&login_from_aymh=1&refid=8', {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cookie': formatCookiesString(initialCookies),
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Referer': 'https://m.facebook.com/'
      },
      httpsAgent: agent
    });
    
    // Update cookies
    const loginPageCookies = {
      ...initialCookies,
      ...parseCookies(loginPageResponse.headers['set-cookie'])
    };
    
    // Extract form inputs
    const formInputs = extractFormInputs(loginPageResponse.data);
    console.log('Form inputs found:', Object.keys(formInputs));
    
    // Prepare login data
    const loginData = new URLSearchParams();
    // Add form fields from the login page
    Object.entries(formInputs).forEach(([key, value]) => {
      if (key !== 'email' && key !== 'pass') {
        loginData.append(key, value);
      }
    });
    
    // Add user credentials
    loginData.append('email', email);
    loginData.append('pass', password);
    loginData.append('login', '1');
    
    // Step 3: Submit login form
    console.log('Submitting login form...');
    const loginResponse = await axios.post('https://m.facebook.com/login/device-based/regular/login/?refsrc=deprecated&lwv=100&refid=8', loginData, {
      headers: {
        'User-Agent': USER_AGENT,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Origin': 'https://m.facebook.com',
        'Connection': 'keep-alive',
        'Cookie': formatCookiesString(loginPageCookies),
        'Referer': 'https://m.facebook.com/login/?next&ref=dbl&fl&login_from_aymh=1&refid=8',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1'
      },
      maxRedirects: 5,
      validateStatus: (status) => status < 500, // Accept all status codes below 500
      httpsAgent: agent
    });
    
    // Get cookies from login response
    const loginResponseCookies = {
      ...loginPageCookies,
      ...parseCookies(loginResponse.headers['set-cookie'])
    };
    
    // Determine if login was successful based on presence of c_user cookie
    const isLoggedIn = 'c_user' in loginResponseCookies;
    
    if (isLoggedIn) {
      console.log('Login successful! Found c_user cookie.');
      
      // Format cookies
      const cookiesJson = formatCookiesJson(loginResponseCookies);
      const cookiesString = formatCookiesString(loginResponseCookies);
      
      return res.json({
        success: true,
        cookies: cookiesJson,
        cookieString: cookiesString
      });
    } else {
      console.log('Login failed. No c_user cookie found.');
      console.log('Response status:', loginResponse.status);
      console.log('Response URL:', loginResponse.request.res.responseUrl || 'unknown');
      
      return res.json({
        success: false,
        message: 'Login failed. Please check your credentials or try again later.'
      });
    }
  } catch (error) {
    console.error('Login error:', error.message);
    
    // Return a structured error response
    res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again later.',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});