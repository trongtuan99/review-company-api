import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import './Register.css';

const Register = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const prefilledEmail = searchParams.get('email') || '';
  const isFromNewsletter = !!prefilledEmail;

  const [formData, setFormData] = useState({
    email: prefilledEmail,
    password: '',
    password_confirmation: '',
    first_name: '',
    last_name: '',
    phone_number: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (prefilledEmail) {
      setFormData(prev => ({ ...prev, email: prefilledEmail }));
    }
  }, [prefilledEmail]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password_confirmation) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    setLoading(true);
    const result = await register(formData);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || t('auth.registerFailed'));
    }

    setLoading(false);
  };

  return (
    <div className="register-container">
      <div className="register-card">
        {isFromNewsletter ? (
          <div className="register-header">
            <div className="step-indicator">
              <span className="step completed">1</span>
              <span className="step-line"></span>
              <span className="step active">2</span>
            </div>
            <h2>{t('auth.completeRegistration')}</h2>
            <p className="register-subtitle">{t('auth.createPasswordSubtitle')}</p>
          </div>
        ) : (
          <h2>{t('auth.register')}</h2>
        )}
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>{t('auth.lastName')}</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                placeholder="Nguyen"
              />
            </div>
            <div className="form-group">
              <label>{t('auth.firstName')}</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                placeholder="Van A"
              />
            </div>
          </div>
          <div className={`form-group ${isFromNewsletter ? 'email-prefilled' : ''}`}>
            <label>{t('auth.email')} {isFromNewsletter && <span className="verified-badge">✓ {t('auth.emailEntered')}</span>}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
              readOnly={isFromNewsletter}
              className={isFromNewsletter ? 'readonly' : ''}
            />
          </div>
          <div className="form-group">
            <label>{t('auth.phone')}</label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="+84123456789"
            />
          </div>
          <div className="form-group">
            <label>{t('auth.password')}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          </div>
          <div className="form-group">
            <label>{t('auth.confirmPassword')}</label>
            <input
              type="password"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? t('auth.registering') : t('auth.registerButton')}
          </button>
        </form>
        <p className="login-link">
          {t('auth.hasAccount')} <Link to="/login">{t('auth.loginNow')}</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
