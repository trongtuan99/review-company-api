import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { configService } from '../services/configService';

const ConfigContext = createContext();

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

// Helper hook for feature flags
export const useFeature = (featureKey) => {
  const { getConfig } = useConfig();
  return getConfig(`feature_${featureKey}`, true);
};

export const ConfigProvider = ({ children }) => {
  const [configs, setConfigs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load public configs on mount
  const loadConfigs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await configService.getPublicConfigs();
      if (response.status === 'ok' || response.status === 'success') {
        const configMap = {};
        (response.data || []).forEach((config) => {
          configMap[config.key] = config.typed_value;
        });
        setConfigs(configMap);
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to load site configs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  // Get config value with fallback
  const getConfig = useCallback(
    (key, defaultValue = null) => {
      return configs[key] !== undefined ? configs[key] : defaultValue;
    },
    [configs]
  );

  // Check if feature is enabled
  const isFeatureEnabled = useCallback(
    (featureKey) => {
      return getConfig(`feature_${featureKey}`, true);
    },
    [getConfig]
  );

  // Contact info helpers
  const contact = {
    email: getConfig('contact_email', ''),
    phone: getConfig('contact_phone', ''),
    address: getConfig('contact_address', ''),
    facebook: getConfig('facebook_url', ''),
    twitter: getConfig('twitter_url', ''),
    linkedin: getConfig('linkedin_url', ''),
  };

  // Appearance helpers
  const appearance = {
    siteName: getConfig('site_name', 'Review Company'),
    tagline: getConfig('site_tagline', ''),
    copyright: getConfig('footer_copyright', ''),
  };

  // Feature flags
  const features = {
    reviewsEnabled: isFeatureEnabled('reviews_enabled'),
    registrationEnabled: isFeatureEnabled('registration_enabled'),
    companyCreationEnabled: isFeatureEnabled('company_creation_enabled'),
    anonymousReviews: isFeatureEnabled('anonymous_reviews'),
    favoritesEnabled: isFeatureEnabled('favorites_enabled'),
    repliesEnabled: isFeatureEnabled('replies_enabled'),
  };

  const value = {
    configs,
    loading,
    error,
    getConfig,
    isFeatureEnabled,
    contact,
    appearance,
    features,
    refreshConfigs: loadConfigs,
  };

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
};

export default ConfigContext;
