import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Sitemap.css';

const Sitemap = () => {
  const { t } = useTranslation();

  const sitemapData = [
    {
      title: t('pages.sitemap.mainPages'),
      icon: '🏠',
      links: [
        { name: t('pages.sitemap.home'), path: '/' },
        { name: t('pages.sitemap.companyList'), path: '/companies' },
        { name: t('pages.sitemap.compareCompanies'), path: '/compare' },
      ],
    },
    {
      title: t('pages.sitemap.account'),
      icon: '👤',
      links: [
        { name: t('pages.sitemap.login'), path: '/login' },
        { name: t('pages.sitemap.register'), path: '/register' },
        { name: t('pages.sitemap.profile'), path: '/profile' },
      ],
    },
    {
      title: t('pages.sitemap.reviews'),
      icon: '⭐',
      links: [
        { name: t('pages.sitemap.writeReview'), path: '/write-review' },
        { name: t('pages.sitemap.reviewGuidelines'), path: '/guidelines' },
      ],
    },
    {
      title: t('pages.sitemap.support'),
      icon: '💬',
      links: [
        { name: t('pages.sitemap.contact'), path: '/contact' },
        { name: t('pages.sitemap.faq'), path: '/faq' },
      ],
    },
    {
      title: t('pages.sitemap.legal'),
      icon: '📋',
      links: [
        { name: t('pages.sitemap.terms'), path: '/terms' },
        { name: t('pages.sitemap.privacy'), path: '/privacy' },
      ],
    },
  ];

  return (
    <div className="sitemap-page">
      <div className="sitemap-container">
        <h1>{t('pages.sitemap.title')}</h1>
        <p className="sitemap-intro">{t('pages.sitemap.intro')}</p>

        <div className="sitemap-grid">
          {sitemapData.map((section, index) => (
            <div key={index} className="sitemap-section">
              <div className="section-header">
                <span className="section-icon">{section.icon}</span>
                <h2>{section.title}</h2>
              </div>
              <ul>
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link to={link.path}>{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="sitemap-footer">
          <p>{t('pages.sitemap.notFoundPage')}</p>
          <Link to="/contact" className="contact-link">
            {t('pages.sitemap.contactUs')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sitemap;
