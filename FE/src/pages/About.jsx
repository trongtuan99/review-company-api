import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './About.css';

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="about-container">
      <div className="about-header">
        <Link to="/" className="back-link">← {t('pages.backToHome')}</Link>
        <h1>{t('pages.about.title')}</h1>
        <p className="about-subtitle">{t('pages.about.subtitle')}</p>
      </div>

      <div className="about-content">
        <section className="about-section">
          <h2>{t('pages.about.whoWeAre')}</h2>
          <p>{t('pages.about.whoWeAreP1')}</p>
          <p>{t('pages.about.whoWeAreP2')}</p>
        </section>

        <section className="about-section">
          <h2>{t('pages.about.mission')}</h2>
          <p>{t('pages.about.missionIntro')}</p>
          <ul className="mission-list">
            <li>{t('pages.about.missionList1')}</li>
            <li>{t('pages.about.missionList2')}</li>
            <li>{t('pages.about.missionList3')}</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>{t('pages.about.features')}</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>{t('pages.about.featureReview')}</h3>
              <p>{t('pages.about.featureReviewDesc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>{t('pages.about.featureComment')}</h3>
              <p>{t('pages.about.featureCommentDesc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>{t('pages.about.featureSearch')}</h3>
              <p>{t('pages.about.featureSearchDesc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>{t('pages.about.featureRanking')}</h3>
              <p>{t('pages.about.featureRankingDesc')}</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>{t('pages.about.contactUs')}</h2>
          <div className="contact-info">
            <p>
              <strong>{t('auth.email')}:</strong>{' '}
              <a href="mailto:contact@reviewcompany.com">contact@reviewcompany.com</a>
            </p>
            <p>
              <strong>{t('auth.phone')}:</strong>{' '}
              <a href="tel:+84123456789">+84 123 456 789</a>
            </p>
            <p>
              <strong>{t('pages.contact.address')}:</strong> {t('footer.address')}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;

