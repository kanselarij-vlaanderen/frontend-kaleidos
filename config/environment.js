'use strict';

module.exports = function (environment) {
  const ENV = {
    modulePrefix: 'frontend-kaleidos',
    environment,
    rootURL: '/',
    locationType: 'history',
    featureFlags: {
      'editor-html-paste': false,
      'editor-browser-delete': true,
    },
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
      },
    },
    APP: {
      // eslint-disable-next-line quotes
      ENABLE_IMPERSONATION: '{{ENABLE_IMPERSONATION}}',
      ENABLE_DEBUG: '{{ENABLE_DEBUG}}',
      ENABLE_DIGITAL_AGENDA: '{{ENABLE_DIGITAL_AGENDA}}',
      ENABLE_DIGITAL_MINUTES: '{{ENABLE_DIGITAL_MINUTES}}'
      // Here you can pass flags/options to your application instance
      // when it is created
    },
    torii: {
      disableRedirectInitializer: true,
      providers: {
        'acmidm-oauth2': {
          apiKey: '{{OAUTH_API_KEY}}',
          baseUrl: '{{OAUTH_BASE_URL}}',
          redirectUri: '{{OAUTH_REDIRECT_URL}}',
          logoutUrl: '{{OAUTH_LOGOUT_URL}}',
          scope: [
            'vo',
            'profile',
            'openid',
            'dkbkaleidos'
          ].join(' '),
        },
      },
    },
    'ember-plausible': {
      enabled: false,
    },
    plausible: {
      domain: '{{ANALYTICS_APP_DOMAIN}}',
      apiHost: '{{ANALYTICS_API_HOST}}',
    }
  };

  if (environment === 'development') {
    ENV.APP.ENABLE_IMPERSONATION = true;
    ENV.APP.ENABLE_DEBUG = true;
    ENV.APP.ENABLE_DIGITAL_AGENDA = true;
    ENV.APP.ENABLE_DIGITAL_MINUTES = true;
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') { // Ember framework integrated tests
    // Testem prefers this...
    ENV.locationType = 'none';
    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;
    ENV.APP.ENABLE_DIGITAL_AGENDA = true;
    ENV.APP.ENABLE_DIGITAL_MINUTES = true;
    ENV.APP.ENABLE_IMPERSONATION = true;
    ENV.APP.ENABLE_DEBUG = true;
    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (environment === 'cypress-test') {
    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;
    ENV.APP.ENABLE_DIGITAL_AGENDA = true;
    ENV.APP.ENABLE_DIGITAL_MINUTES = true;
    ENV.APP.ENABLE_DEBUG = false;
  }

  return ENV;
};
