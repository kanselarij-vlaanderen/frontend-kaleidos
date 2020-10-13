/* eslint-disable object-curly-newline */
module.exports = function(environment) {
  const ENV = {
    modulePrefix: 'fe-redpencil',
    podModulePrefix: 'fe-redpencil/pods',
    environment,
    rootURL: '/',
    locationType: 'auto',
    moment: {
      includeLocales: ['nl'],
      allowEmpty: true,
      outputFormat: 'L',
    },
    piwik: {
      sid: 1,
      url: 'https://dev-kaleidos-matomo.redpencil.io',
    },
    featureFlags: {
      'editor-html-paste': true,
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
      // Here you can pass flags/options to your application instance
      // when it is created
    },
    torii: {
      disableRedirectInitializer: true,
      providers: {
        'acmidm-oauth2': {
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

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (environment === 'cypress-test') {
    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.torii.providers['acmidm-oauth2'].logoutUrl = '/mock-login';
  }

  if (environment === 'production') {
    if (!process.env.DEPLOY_ENV) { //  === 'development'
      ENV.torii.providers['acmidm-oauth2'].apiKey = 'b1c78c1e-3c88-44f4-90fa-bebc5c5dc28d';
      ENV.torii.providers['acmidm-oauth2'].baseUrl = 'https://authenticatie-ti.vlaanderen.be/op/v1/auth';
      ENV.torii.providers['acmidm-oauth2'].redirectUri = 'https://kaleidos-dev.vlaanderen.be/authorization/callback';
      ENV.torii.providers['acmidm-oauth2'].logoutUrl = 'https://authenticatie-ti.vlaanderen.be/op/v1/logout';
    }

    if (process.env.DEPLOY_ENV === 'test') {
      ENV.torii.providers['acmidm-oauth2'].apiKey = '556bc0c9-d04e-45c8-b465-09e68071ed0a';
      ENV.torii.providers['acmidm-oauth2'].baseUrl = 'https://authenticatie-ti.vlaanderen.be/op/v1/auth';
      ENV.torii.providers['acmidm-oauth2'].redirectUri = 'https://kaleidos-test.vlaanderen.be/authorization/callback';
      ENV.torii.providers['acmidm-oauth2'].logoutUrl = 'https://authenticatie-ti.vlaanderen.be/op/v1/logout';
    }

    if (process.env.DEPLOY_ENV === 'production') {
      ENV.torii.providers['acmidm-oauth2'].apiKey = 'cb70a19f-4189-4af3-b88f-9d3adaa1aca1';
      ENV.torii.providers['acmidm-oauth2'].baseUrl = 'https://authenticatie.vlaanderen.be/op/v1/auth';
      ENV.torii.providers['acmidm-oauth2'].redirectUri = 'https://kaleidos.vlaanderen.be/authorization/callback';
      ENV.torii.providers['acmidm-oauth2'].logoutUrl = 'https://authenticatie.vlaanderen.be/op/v1/logout';
    }
  }

  return ENV;
};
