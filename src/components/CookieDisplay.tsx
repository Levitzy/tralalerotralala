import { useState } from 'react';
import { Cookie } from '../utils/CookieParser';

interface CookieDisplayProps {
  cookies: Cookie[];
  cookieString: string;
}

export function CookieDisplay({ cookies, cookieString }: CookieDisplayProps) {
  const [displayMode, setDisplayMode] = useState<'json' | 'string'>('json');

  return (
    <div className="cookie-display">
      <h2>Facebook Cookies</h2>
      <div className="display-tabs">
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
          <div className="json-view">
            <h3>JSON</h3>
            <pre>{JSON.stringify(cookies, null, 2)}</pre>
            <button 
              className="copy-button"
              onClick={() => navigator.clipboard.writeText(JSON.stringify(cookies, null, 2))}
            >
              Copy to Clipboard
            </button>
          </div>
        ) : (
          <div className="string-view">
            <h3>Cookie String</h3>
            <pre>{cookieString}</pre>
            <button 
              className="copy-button"
              onClick={() => navigator.clipboard.writeText(cookieString)}
            >
              Copy to Clipboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}