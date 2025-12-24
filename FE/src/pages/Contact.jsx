import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { contactService } from '../services/contactService';
import './Contact.css';

const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await contactService.sendMessage(formData);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || t('pages.contact.errorMessage'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        <div className="contact-header">
          <h1>{t('pages.contact.title')}</h1>
          <p>{t('pages.contact.subtitle')}</p>
        </div>

        <div className="contact-content">
          <div className="contact-info">
            <h2>{t('pages.contact.contactInfo')}</h2>

            <div className="info-item">
              <div className="info-icon">📍</div>
              <div>
                <h3>{t('pages.contact.address')}</h3>
                <p>{t('footer.address')}</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">📧</div>
              <div>
                <h3>{t('auth.email')}</h3>
                <p>
                  <a href="mailto:contact@reviewcompany.com">contact@reviewcompany.com</a>
                </p>
                <p>
                  <a href="mailto:support@reviewcompany.com">support@reviewcompany.com</a>
                </p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">📞</div>
              <div>
                <h3>{t('pages.contact.phone')}</h3>
                <p><a href="tel:+84123456789">+84 123 456 789</a></p>
                <p className="sub-text">{t('pages.contact.phoneHours')}</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">💬</div>
              <div>
                <h3>{t('pages.contact.socialMedia')}</h3>
                <div className="social-links">
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-form-wrapper">
            <h2>{t('pages.contact.sendMessage')}</h2>

            {error && <div className="error-message">{error}</div>}

            {submitted ? (
              <div className="success-message">
                <div className="success-icon">✅</div>
                <h3>{t('pages.contact.thankYou')}</h3>
                <p>{t('pages.contact.messageSent')}</p>
                <button onClick={() => { setSubmitted(false); setError(''); setFormData({ name: '', email: '', subject: '', message: '' }); }}>
                  {t('pages.contact.sendAnother')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">{t('pages.contact.fullName')} *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">{t('auth.email')} *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">{t('pages.contact.subject')} *</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">{t('pages.contact.selectSubject')}</option>
                    <option value="general">{t('pages.contact.subjectGeneral')}</option>
                    <option value="support">{t('pages.contact.subjectSupport')}</option>
                    <option value="feedback">{t('pages.contact.subjectFeedback')}</option>
                    <option value="business">{t('pages.contact.subjectBusiness')}</option>
                    <option value="report">{t('pages.contact.subjectReport')}</option>
                    <option value="other">{t('pages.contact.subjectOther')}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">{t('pages.contact.content')} *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder={t('pages.contact.contentPlaceholder')}
                  />
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? t('common.sending') : t('pages.contact.submit')}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="map-section">
          <h2>{t('pages.contact.ourLocation')}</h2>
          <div className="map-placeholder">
            <div className="map-icon">🗺️</div>
            <p>{t('pages.contact.googleMaps')}</p>
            <span>{t('footer.address')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
