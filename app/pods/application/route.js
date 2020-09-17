import Route from '@ember/routing/route';
import ENV from 'fe-redpencil/config/environment';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import { inject as service } from '@ember/service';

export default Route.extend(ApplicationRouteMixin, {
  moment: service(),
  intl: service(),
  currentSession: service(),
  fileService: service(),
  routeAfterAuthentication: 'agendas',
  router: service(),

  beforeModel() {
    this._super(...arguments);
    this.get('moment').setLocale('nl');
    this.set('moment.defaultFormat', 'DD.MM.YYYY');
    this.get('moment').set('allowEmpty', true);
    this.intl.setLocale('nl-be');
    return this._loadCurrentSession();
  },

  checkSupportedBrowser() {
    // eslint-disable-next-line no-undef
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
    const {
      logoutUrl,
    } = ENV.torii.providers['acmidm-oauth2'];
    window.location.replace(logoutUrl);
  },

  async userRoleOfSession() {
    const role = await this.get('currentSession.userRole');
    if (role) {
      return role;
    }
    return null;
  },

  userHasValidGroup(role) {
    if (role !== 'no-access' && role !== 'users') {
      return true;
    }
    return false;
  },

  async isUserLoggedIn() {
    return await this.get('session.isAuthenticated');
  },

  async isValidUser() {
    const userRoleOfSession = await this.userRoleOfSession();
    return this.userHasValidGroup(userRoleOfSession);
  },

  async model() {
    const userIsLoggedIn = await this.isUserLoggedIn();
    if (userIsLoggedIn) {
      const userRoleOfSession = await this.userRoleOfSession();
      if (userRoleOfSession !== null) {
        const validUser = await this.isValidUser();
        if (!validUser) {
          this.transitionTo('accountless-users');
        }
      }
    }
    if (!this.checkSupportedBrowser()) {
      this.transitionTo('not-supported');
    }
    return this.checkSupportedBrowser();
  },

  _loadCurrentSession() {
    return this.currentSession.load().catch(() => this.session.invalidate());
  },

  actions: {
    // eslint-disable-next-line object-shorthand
    willTransition: async function(transition) {
      const userRoleOfSession = await this.userRoleOfSession();
      const validUser = await this.isValidUser();
      if (userRoleOfSession !== null) {
        if (!validUser) {
          this.transitionTo('accountless-users');
        }
      }

      if (
        this.fileService.get('deleteDocumentContainerWithUndo.isRunning')
        && confirm(this.intl.t('leave-page-message'))
      ) {
        transition.abort();
      } else {
        return true;
      }
    },
  },
});
