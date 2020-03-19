import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import ENV from 'fe-redpencil/config/environment';

import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

export default Route.extend(ApplicationRouteMixin, {
  moment: inject(),
  intl: inject(),
  currentSession: inject(),
  fileService: inject(),
  routeAfterAuthentication: 'agendas',

  beforeModel() {
    this._super(...arguments);
    this.get('moment').setLocale('nl');
    this.set('moment.defaultFormat', 'DD.MM.YYYY');
    this.get('moment').set('allowEmpty', true);
    this.intl.setLocale('nl-be');
    return this._loadCurrentSession();
  },

  checkSupportedBrowser() {
    const isFirefox = typeof InstallTrigger !== 'undefined';
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isChrome = window.chrome;
    const isCypress = !!window.Cypress && (window.Cypress.browser.family === 'chrome' || window.Cypress.browser.family === 'electron' || window.Cypress.browser.family === 'chromium');
    return isFirefox || isChrome || isSafari || isCypress;
  },

  sessionAuthenticated() {
    this._super(...arguments);
    this._loadCurrentSession();
  },

  async sessionInvalidated() {
    const logoutUrl = ENV['torii']['providers']['acmidm-oauth2']['logoutUrl'];
    window.location.replace(logoutUrl);
  },

  model() {
    if (!this.checkSupportedBrowser()) {
      this.transitionTo('not-supported');
    }
    return this.checkSupportedBrowser();
  },

  _loadCurrentSession() {
    return this.currentSession.load().catch(() => this.session.invalidate());
  },

  actions: {
    willTransition: function (transition) {
      if (
        this.fileService.get('deleteDocumentWithUndo.isRunning') &&
        confirm(this.intl.t('leave-page-message'))
      ) {
        transition.abort();
      } else {
        return true;
      }
    },
  },
});
