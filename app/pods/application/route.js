import Route from '@ember/routing/route';
import ENV from 'fe-redpencil/config/environment';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

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

  async userHasValidGroup(currentRouteName) {
    if (currentRouteName.includes('loading')) {
      return false;
    }

    const user = await this.get('session.isAuthenticated');
    if (!user) {
      return false;
    }

    const role = await this.get('currentSession.userRole');
    if (role !== 'no-access' && role !== 'users') {
      return true;
    }
    return false;
  },

  isValidUser: computed('router.{currentRouteName,rootUrl}', 'currentSession.userRole', 'session.isAuthenticated', async function (){
    if (!this.router) {
      return false;
    }
    const currentRouteName = this.router.currentRouteName;

    if(currentRouteName) {
      return this.userHasValidGroup(currentRouteName);
    }

    if(this.router.rootURL) {
      return this.userHasValidGroup(this.router.rootURL);
    }

    return false;
  }),

  async model() {

    if( !await this.isValidUser) {
      this.transitionTo('accountless-users');
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
    willTransition: async function (transition) {
      if(!await this.isValidUser) {
        this.transitionTo('accountless-users');
      }
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
