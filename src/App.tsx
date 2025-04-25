import { useState } from 'react';
import { LoginForm } from './components/LoginForm';
import { CookieDisplay } from './components/CookieDisplay';
import { AuthService } from './services/AuthService';
import { Cookie } from './utils/CookieParser';
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
    <div className="app">
      {!isLoggedIn ? (
        <>
          <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
          <div className="mock-toggle">
            <label>
              <input 
                type="checkbox" 
                checked={useMock} 
                onChange={() => setUseMock(!useMock)}
              />
              Use mock data (for testing)
            </label>
          </div>
          {error && <div className="error-message">{error}</div>}
        </>
      ) : (
        <div className="logged-in-container">
          <div className="success-message">
            <h2>Login Successful!</h2>
            <p>You have successfully logged in to your Facebook account.</p>
          </div>
          <CookieDisplay cookies={cookies} cookieString={cookieString} />
          <button 
            className="logout-button"
            onClick={() => setIsLoggedIn(false)}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default App;