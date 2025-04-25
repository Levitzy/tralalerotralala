import { useState } from 'react';
import '../facebook.css';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  isLoading: boolean;
}

export function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <div>
      <div className="facebook-header">
        <h1 className="facebook-logo">facebook</h1>
        <p className="facebook-tagline">Connect with friends and the world around you on Facebook.</p>
      </div>
      <div className="login-card">
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <input
              type="text"
              placeholder="Email or phone number"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
            />
          </div>
          <div className="form-field">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input"
            />
          </div>
          <div className="form-field">
            <button 
              type="submit" 
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </div>
          <div className="forgot-password">
            <a href="#forgot">Forgotten password?</a>
          </div>
          <div className="divider"></div>
          <div className="create-account">
            <button type="button" className="create-button">
              Create New Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}