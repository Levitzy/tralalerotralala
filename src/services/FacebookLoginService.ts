import axios, { AxiosResponse } from 'axios';
import { Cookie } from '../utils/CookieParser';

// Interface definitions
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  cookies: Cookie[];
  cookieString: string;
  message?: string;
}

interface FormInputs {
  [key: string]: string;
}

// Main service class for handling Facebook login
export class FacebookLoginService {
  private static readonly USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
  private static readonly BASE_URL = 'https://m.facebook.com';
  
  // Parse cookies from Set-Cookie header
  private static parseCookies(cookieHeaders: string | string[]): Record<string, string> {
    const cookies: Record<string, string> = {};
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
  
  // Extract form inputs from HTML
  private static extractFormInputs(html: string): FormInputs {
    const inputs: FormInputs = {};
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
  
  // Format cookies to JSON format
  private static formatCookiesJson(cookies: Record<string, string>): Cookie[] {
    const result: Cookie[] = [];
    for (const [key, value] of Object.entries(cookies)) {
      if (key && value) {
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
  
  // Format cookies to string format
  private static formatCookiesString(cookies: Record<string, string>): string {
    return Object.entries(cookies)
      .filter(([key, value]) => key && value)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
  }
  
  // Main login method
  public static async login(email: string, password: string): Promise<LoginResponse> {
    try {
      // Step 1: Get initial page and cookies
      console.log('Fetching initial Facebook page...');
      const initialResponse = await axios.get(`${this.BASE_URL}/`, {
        headers: {
          'User-Agent': this.USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        }
      });
      
      // Parse initial cookies
      const initialCookies = this.parseCookies(initialResponse.headers['set-cookie'] as string[]);
      console.log('Initial cookies obtained:', Object.keys(initialCookies));
      
      // Step 2: Get login page to extract form fields
      console.log('Fetching login page...');
      const loginPageResponse = await axios.get(`${this.BASE_URL}/login/?next&ref=dbl&fl&login_from_aymh=1&refid=8`, {
        headers: {
          'User-Agent': this.USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Cookie': this.formatCookiesString(initialCookies),
          'Upgrade-Insecure-Requests': '1',
          'Referer': `${this.BASE_URL}/`
        }
      });
      
      // Update cookies
      const loginPageCookies = {
        ...initialCookies,
        ...this.parseCookies(loginPageResponse.headers['set-cookie'] as string[])
      };
      
      // Extract form inputs
      const formInputs = this.extractFormInputs(loginPageResponse.data);
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
      const loginResponse = await axios.post(
        `${this.BASE_URL}/login/device-based/regular/login/?refsrc=deprecated&lwv=100&refid=8`,
        loginData.toString(),
        {
          headers: {
            'User-Agent': this.USER_AGENT,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Origin': this.BASE_URL,
            'Connection': 'keep-alive',
            'Cookie': this.formatCookiesString(loginPageCookies),
            'Referer': `${this.BASE_URL}/login/?next&ref=dbl&fl&login_from_aymh=1&refid=8`,
            'Upgrade-Insecure-Requests': '1',
          },
          maxRedirects: 5,
          validateStatus: (status) => status < 500, // Accept all status codes below 500
        }
      );
      
      // Get cookies from login response
      const loginResponseCookies = {
        ...loginPageCookies,
        ...this.parseCookies(loginResponse.headers['set-cookie'] as string[])
      };
      
      // Determine if login was successful based on presence of c_user cookie
      const isLoggedIn = 'c_user' in loginResponseCookies;
      
      if (isLoggedIn) {
        console.log('Login successful! Found c_user cookie.');
        
        // Format cookies
        const cookiesJson = this.formatCookiesJson(loginResponseCookies);
        const cookiesString = this.formatCookiesString(loginResponseCookies);
        
        return {
          success: true,
          cookies: cookiesJson,
          cookieString: cookiesString
        };
      } else {
        console.log('Login failed. No c_user cookie found.');
        console.log('Response status:', loginResponse.status);
        
        return {
          success: false,
          cookies: [],
          cookieString: '',
          message: 'Login failed. Please check your credentials or try again later.'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      
      return {
        success: false,
        cookies: [],
        cookieString: '',
        message: 'An error occurred during login. Please try again later.'
      };
    }
  }

  // Mock login method for testing
  public static async mockLogin(): Promise<LoginResponse> {
    // Mock cookies data
    const mockCookies: Cookie[] = [
      {
        key: "datr",
        value: "dksAaC-xRY5S3XyTRsRIy1gE",
        domain: "facebook.com",
        path: "/",
        hostOnly: false,
        creation: "2025-04-17T00:29:42.791Z",
        lastAccessed: "2025-04-17T00:29:42.794Z"
      },
      {
        key: "m_pixel_ratio",
        value: "2.4000000953674316",
        domain: "facebook.com",
        path: "/",
        hostOnly: false,
        creation: "2025-04-17T00:29:42.792Z",
        lastAccessed: "2025-04-17T00:29:42.795Z"
      },
      {
        key: "c_user",
        value: "61575046633283",
        domain: "facebook.com",
        path: "/",
        hostOnly: false,
        creation: "2025-04-17T00:29:42.794Z",
        lastAccessed: "2025-04-17T00:29:42.797Z"
      },
      {
        key: "xs",
        value: "16:DIKdDF3kaTwatQ:2:1744849782:-1:-1",
        domain: "facebook.com",
        path: "/",
        hostOnly: false,
        creation: "2025-04-17T00:29:42.796Z",
        lastAccessed: "2025-04-17T00:29:42.799Z"
      },
      {
        key: "fr",
        value: "0MEtk9yx1fbLPgw1u.AWdbEW0AHBQkM2tQ-N_tis1OjAcJB4hYWkfvEhJzU0dN7sSCWaE.BoAEt2..AAA.0.0.BoAEt2.AWe3vcPoxl-ZcEGArlRTZqTAyBA",
        domain: "facebook.com",
        path: "/",
        hostOnly: false,
        creation: "2025-04-17T00:29:42.795Z",
        lastAccessed: "2025-04-17T00:29:42.798Z"
      }
    ];
    
    const mockCookieString = "datr=X9v4ZwfBCIUBJOPOwhI4OQiV; sb=X9v4Z2fbJPuZZe78l_8lotzn; m_pixel_ratio=2.4000000953674316; c_user=100029544710738; xs=17%3AFmU6DcxD5R_Tbg%3A2%3A1744362402%3A-1%3A8065; fr=0PNG1hXyrlGaOWRs9.AWc3G8S2EvXHPsd03dK1Sb3MxofJpCZ76a4gMtpFNqVp2LyDC9E.Bn-Ntf..AAA.0.0.Bn-Nug";
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    return {
      success: true,
      cookies: mockCookies,
      cookieString: mockCookieString
    };
  }
}