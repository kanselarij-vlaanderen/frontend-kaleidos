import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

function isSupportedBrowser() {
  // eslint-disable-next-line no-undef
  const isFirefox = typeof InstallTrigger !== 'undefined';
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isChrome = window.chrome;
  const isCypress = !!window.Cypress && (window.Cypress.browser.family === 'chrome' || window.Cypress.browser.family === 'electron' || window.Cypress.browser.family === 'chromium');
  return isFirefox || isChrome || isSafari || isCypress;
}

export default class ApplicationRoute extends Route {
  @service moment;
  @service intl;
  @service session;
  @service currentSession;
  @service fileService;
  @service router;
  @service metrics;

  init() {
    super.init(...arguments);
    this.setupTracking();
  }

  async beforeModel() {
    this.moment.setLocale('nl');
    this.moment.defaultFormat = 'DD.MM.YYYY';
    this.moment.allowEmpty = true;
    this.intl.setLocale('nl-be');

    if (!isSupportedBrowser()) {
      this.transitionTo('not-supported');
    }

    try {
      await this.currentSession.load();
    } catch (error) { // eslint-disable-line no-unused-vars
      this.session.invalidate();
    }

    if (this.session.isAuthenticated && !this.currentSession.hasValidUserRole) {
      this.transitionTo('accountless-users');
    }
  }

  setupTracking() {
    this.router.on('routeDidChange', () => {
      this.metrics.trackPage({
        page: this.router.currentURL,
        title: this.router.currentRouteName,
      });
    });
  }

  @action
  willTransition(transition) {
    if (this.session.isAuthenticated && !this.currentSession.hasValidUserRole) {
      this.transitionTo('accountless-users');
    }

    if (
      this.fileService.get('deleteDocumentContainerWithUndo.isRunning')
        && confirm(this.intl.t('leave-page-message'))
    ) {
      transition.abort();
    }
  }
}
