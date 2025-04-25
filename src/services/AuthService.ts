import { FacebookLoginService } from './FacebookLoginService';
import { Cookie } from '../utils/CookieParser';

interface LoginResponse {
  success: boolean;
  cookies: Cookie[];
  cookieString: string;
  message?: string;
}

export class AuthService {
  static async login(email: string, password: string): Promise<LoginResponse> {
    try {
      // Use the new FacebookLoginService
      return await FacebookLoginService.login(email, password);
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        cookies: [],
        cookieString: '',
        message: 'An error occurred during login. Please try again.'
      };
    }
  }

  // Use the mock login for testing
  static async mockLogin(): Promise<LoginResponse> {
    try {
      // Use the mock login method from FacebookLoginService
      return await FacebookLoginService.mockLogin();
    } catch (error) {
      console.error('Mock login error:', error);
      
      // Fallback to hardcoded mock data if service call fails
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
          key: "wd",
          value: "492x880",
          domain: "facebook.com",
          path: "/",
          hostOnly: false,
          creation: "2025-04-17T00:29:42.793Z",
          lastAccessed: "2025-04-17T00:29:42.796Z"
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
          key: "fr",
          value: "0MEtk9yx1fbLPgw1u.AWdbEW0AHBQkM2tQ-N_tis1OjAcJB4hYWkfvEhJzU0dN7sSCWaE.BoAEt2..AAA.0.0.BoAEt2.AWe3vcPoxl-ZcEGArlRTZqTAyBA",
          domain: "facebook.com",
          path: "/",
          hostOnly: false,
          creation: "2025-04-17T00:29:42.795Z",
          lastAccessed: "2025-04-17T00:29:42.798Z"
        },
        {
          key: "xs",
          value: "16:DIKdDF3kaTwatQ:2:1744849782:-1:-1",
          domain: "facebook.com",
          path: "/",
          hostOnly: false,
          creation: "2025-04-17T00:29:42.796Z",
          lastAccessed: "2025-04-17T00:29:42.799Z"
        }
      ];
      
      const mockCookieString = "datr=X9v4ZwfBCIUBJOPOwhI4OQiV; sb=X9v4Z2fbJPuZZe78l_8lotzn; m_pixel_ratio=2.4000000953674316; wd=492x880; c_user=100029544710738; fr=0PNG1hXyrlGaOWRs9.AWc3G8S2EvXHPsd03dK1Sb3MxofJpCZ76a4gMtpFNqVp2LyDC9E; xs=17%3AFmU6DcxD5R_Tbg%3A2%3A1744362402%3A-1%3A8065";
      
      return {
        success: true,
        cookies: mockCookies,
        cookieString: mockCookieString
      };
    }
  }
}