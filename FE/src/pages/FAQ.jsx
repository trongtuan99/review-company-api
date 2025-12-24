import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './FAQ.css';

const FAQ = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { question: t('pages.faq.q1'), answer: t('pages.faq.a1') },
    { question: t('pages.faq.q2'), answer: t('pages.faq.a2') },
    { question: t('pages.faq.q3'), answer: t('pages.faq.a3') },
    { question: t('pages.faq.q4'), answer: t('pages.faq.a4') },
    { question: t('pages.faq.q5'), answer: t('pages.faq.a5') },
    { question: t('pages.faq.q6'), answer: t('pages.faq.a6') },
    { question: t('pages.faq.q7'), answer: t('pages.faq.a7') },
    { question: t('pages.faq.q8'), answer: t('pages.faq.a8') }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-container">
      <div className="faq-header">
        <Link to="/" className="back-link">← {t('pages.backToHome')}</Link>
        <h1>{t('pages.faq.title')}</h1>
        <p className="faq-subtitle">{t('pages.faq.subtitle')}</p>
      </div>

      <div className="faq-content">
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className={`faq-item ${openIndex === index ? 'open' : ''}`}>
              <button
                className="faq-question"
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
              >
                <span className="faq-question-text">{faq.question}</span>
                <span className="faq-icon">{openIndex === index ? '−' : '+'}</span>
              </button>
              {openIndex === index && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="faq-contact">
          <h2>{t('pages.faq.notFound')}</h2>
          <p>{t('pages.faq.notFoundDesc')}</p>
          <div className="contact-buttons">
            <a href="mailto:contact@reviewcompany.com" className="contact-btn">
              📧 {t('pages.faq.sendEmail')}
            </a>
            <Link to="/contact" className="contact-btn">
              📝 {t('pages.faq.contactLink')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;

