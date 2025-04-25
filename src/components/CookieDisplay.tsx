import { useState } from 'react';
import { Cookie } from '../utils/CookieParser';
import '../facebook.css';

interface CookieDisplayProps {
  cookies: Cookie[];
  cookieString: string;
}

export function CookieDisplay({ cookies, cookieString }: CookieDisplayProps) {
  const [displayMode, setDisplayMode] = useState<'json' | 'string'>('json');

  return (
    <div className="cookies-container">
      <h2>Facebook Cookies</h2>
      <div className="tab-buttons">
        <button 
          className={`tab-button ${displayMode === 'json' ? 'active' : ''}`}
          onClick={() => setDisplayMode('json')}
        >
          JSON Format
        </button>
        <button 
          className={`tab-button ${displayMode === 'string' ? 'active' : ''}`}
          onClick={() => setDisplayMode('string')}
        >
          String Format
        </button>
      </div>
      
      <div className="cookie-content">
        {displayMode === 'json' ? (
          <div>
            <h3>JSON</h3>
            <pre className="cookie-data">
              {JSON.stringify(cookies, null, 2)}
            </pre>
            <button 
              className="copy-button"
              onClick={() => navigator.clipboard.writeText(JSON.stringify(cookies, null, 2))}
            >
              <span style={{ marginRight: '0.5rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                </svg>
              </span>
              Copy to Clipboard
            </button>
          </div>
        ) : (
          <div>
            <h3>Cookie String</h3>
            <pre className="cookie-data">
              {cookieString}
            </pre>
            <button 
              className="copy-button"
              onClick={() => navigator.clipboard.writeText(cookieString)}
            >
              <span style={{ marginRight: '0.5rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                </svg>
              </span>
              Copy to Clipboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}