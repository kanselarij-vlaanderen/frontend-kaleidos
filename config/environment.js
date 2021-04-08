/* eslint-disable object-curly-newline */
module.exports = function(environment) {
  const ENV = {
    modulePrefix: 'frontend-kaleidos',
    podModulePrefix: 'frontend-kaleidos/pods',
    environment,
    rootURL: '/',
    locationType: 'auto',
    moment: {
      includeLocales: ['nl'],
      allowEmpty: true,
      outputFormat: 'L',
    },
    metricsAdapters: [
      {
        name: 'Matomo',
        environments: ['production'],
        config: {
          scriptUrl: 'https://dev-kaleidos-matomo.redpencil.io', // Can optionally be CDN-sourced
          trackerUrl: 'https://dev-kaleidos-matomo.redpencil.io',
          siteId: '{{METRICS_SITE_ID}}',
          disableCookies: true, // <- for GDPR
        },
      }
    ],
    featureFlags: {
      'editor-html-paste': false,
    },
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false,
      },
    },
    APP: {
      // eslint-disable-next-line quotes
      ENABLE_PUBLICATIONS_TAB: '{{ENABLE_PUBLICATIONS_TAB}}',
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
            'dkbkaleidos',
            'phone'
          ].join(' '),
        },
      },
    },
  };

  if (environment === 'development') {
    ENV.APP.ENABLE_PUBLICATIONS_TAB = true;
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
    ENV.APP.ENABLE_PUBLICATIONS_TAB = true;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (environment === 'cypress-test') {
    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;
    ENV.APP.ENABLE_PUBLICATIONS_TAB = true;
  }

  return ENV;
};
