/**
 * Production Configuration
 * Environment settings and optimization flags
 */

export const PRODUCTION_CONFIG = {
  // Environment Detection
  isDevelopment: import.meta.env.MODE === "development",
  isProduction: import.meta.env.MODE === "production",
  isStaging: import.meta.env.MODE === "staging",

  // API Configuration
  api: {
    baseURL: import.meta.env.VITE_API_URL || "https://api.computerexcellenceacademy.com",
    timeout: 30000,
    retries: 3,
  },

  // SEO Configuration
  seo: {
    enableSitemap: true,
    enableRobotsTxt: true,
    enableBreadcrumbs: true,
    enableOpenGraph: true,
    enableTwitterCard: true,
    enableSchemaMarkup: true,
  },

  // Performance Configuration
  performance: {
    enableImageLazyLoading: true,
    enableCodeSplitting: true,
    enableCaching: true,
    cacheDuration: 3600, // seconds
    maxCacheSize: 50 * 1024 * 1024, // 50MB
  },

  // Security Configuration
  security: {
    enableCSP: true,
    enableHTTPS: true,
    enableXFrameOptions: true,
    enableXContentTypeOptions: true,
    contentSecurityPolicy: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'", "*.googletagmanager.com"],
      "style-src": ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      "img-src": ["'self'", "data:", "*.vercel.app", "*.amazonaws.com"],
      "font-src": ["'self'", "fonts.gstatic.com"],
      "connect-src": ["'self'", "*.computerexcellenceacademy.com"],
    },
  },

  // Analytics Configuration
  analytics: {
    enableGoogleAnalytics: true,
    enableHotjar: true,
    googleAnalyticsId: import.meta.env.VITE_GA_ID || "G-XXXXXXXXXX",
  },

  // Feature Flags
  features: {
    enableAIAssistant: true,
    enableLiveChat: false, // Will be enabled in production
    enableUserAnalytics: true,
    enableRecommendations: true,
    enableNotifications: true,
  },

  // Logging Configuration
  logging: {
    enableErrorTracking: true,
    enablePerformanceMonitoring: true,
    enableNetworkMonitoring: false, // Only in development
    logLevel: import.meta.env.MODE === "production" ? "error" : "debug",
  },

  // Deployment Configuration
  deployment: {
    provider: "vercel", // vercel, netlify, aws, etc.
    region: "auto",
    enableAutoScale: true,
    enableCDN: true,
  },
};

/**
 * Get environment-specific configuration
 */
export const getEnvironmentConfig = () => {
  if (PRODUCTION_CONFIG.isProduction) {
    return {
      ...PRODUCTION_CONFIG,
      api: { ...PRODUCTION_CONFIG.api, timeout: 20000 },
      logging: { ...PRODUCTION_CONFIG.logging, enableNetworkMonitoring: false },
    };
  }

  if (PRODUCTION_CONFIG.isStaging) {
    return {
      ...PRODUCTION_CONFIG,
      analytics: { ...PRODUCTION_CONFIG.analytics, enableHotjar: true },
    };
  }

  return PRODUCTION_CONFIG;
};

/**
 * Validate production readiness
 */
export const validateProductionReadiness = () => {
  const issues = [];

  if (!import.meta.env.VITE_API_URL) {
    issues.push("VITE_API_URL environment variable is not set");
  }

  if (!import.meta.env.VITE_GA_ID && PRODUCTION_CONFIG.isProduction) {
    issues.push("Google Analytics ID is not configured for production");
  }

  if (PRODUCTION_CONFIG.isProduction && !import.meta.env.HTTPS) {
    issues.push("HTTPS should be enabled in production");
  }

  return {
    isReady: issues.length === 0,
    issues,
    timestamp: new Date().toISOString(),
  };
};

export default PRODUCTION_CONFIG;
