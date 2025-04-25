export interface Cookie {
    key: string;
    value: string;
    domain: string;
    path: string;
    hostOnly: boolean;
    creation: string;
    lastAccessed: string;
  }
  
  export class CookieParser {
    static parseSetCookieHeader(headers: Record<string, any>): Cookie[] {
      const cookies: Cookie[] = [];
      const setCookieHeaders = headers['set-cookie'] || [];
      
      setCookieHeaders.forEach((cookieStr: string) => {
        const [keyValue, ...options] = cookieStr.split(';');
        const [key, value] = keyValue.trim().split('=');
        
        const cookie: Cookie = {
          key: key,
          value: value,
          domain: 'facebook.com',
          path: '/',
          hostOnly: false,
          creation: new Date().toISOString(),
          lastAccessed: new Date().toISOString()
        };
  
        options.forEach((option: string) => {
          const [optKey, optValue] = option.trim().split('=');
          if (optKey.toLowerCase() === 'domain') {
            cookie.domain = optValue || 'facebook.com';
          } else if (optKey.toLowerCase() === 'path') {
            cookie.path = optValue || '/';
          }
        });
  
        cookies.push(cookie);
      });
  
      return cookies;
    }
  
    static cookiesToString(cookies: Cookie[]): string {
      return cookies.map(cookie => `${cookie.key}=${cookie.value}`).join('; ');
    }
  }