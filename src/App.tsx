import { useState } from 'react';
import { LoginForm } from './components/LoginForm';
import { CookieDisplay } from './components/CookieDisplay';
import { AuthService } from './services/AuthService';
import { Cookie } from './utils/CookieParser';
import './facebook.css';
import './index.css';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cookies, setCookies] = useState<Cookie[]>([]);
  const [cookieString, setCookieString] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [useMock, setUseMock] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      let result;
      
      if (useMock) {
        // Use mock data for testing
        result = await AuthService.mockLogin();
      } else {
        // Use real implementation
        result = await AuthService.login(email, password);
      }

      if (result.success) {
        setCookies(result.cookies);
        setCookieString(result.cookieString);
        setIsLoggedIn(true);
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="content">
        {!isLoggedIn ? (
          <>
            <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
            
            <div className="test-mode">
              <label className="checkbox-container">
                <input 
                  type="checkbox" 
                  checked={useMock} 
                  onChange={() => setUseMock(!useMock)}
                  className="checkbox"
                />
                <span>Use mock data (for testing)</span>
              </label>
            </div>
            
            {error && (
              <div className="error-message">
                <strong>Error:</strong> {error}
              </div>
            )}
          </>
        ) : (
          <div className="login-card">
            <div className="success-banner">
              <h2 className="success-title">Login Successful!</h2>
              <p className="success-message">
                You have successfully logged in to your Facebook account.
              </p>
            </div>
            
            <CookieDisplay cookies={cookies} cookieString={cookieString} />
            
            <div className="logout-section">
              <button 
                className="logout-button"
                onClick={() => setIsLoggedIn(false)}
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;