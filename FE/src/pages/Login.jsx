import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';
import './Login.css';

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Login failed');
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{t('auth.login')}</h2>
        {error && (
          <div className="error-message">
            <p style={{ whiteSpace: 'pre-line', marginBottom: '10px' }}>{error}</p>
            {(error.includes('Network Error') || error.includes('server')) && (
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#721c24', background: '#f8d7da', padding: '10px', borderRadius: '5px' }}>
                <p style={{ marginBottom: '5px' }}><strong>{t('home.currentUrl')}:</strong> <code>{API_BASE_URL}</code></p>
              </div>
            )}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>
          <div className="form-group">
            <label>{t('auth.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? t('auth.loggingIn') : t('auth.loginButton')}
          </button>
        </form>
        <p className="register-link">
          {t('auth.noAccount')} <Link to="/register">{t('auth.registerNow')}</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
