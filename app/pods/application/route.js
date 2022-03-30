import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';

export default class ApplicationRoute extends Route {
  @service moment;
  @service intl;
  @service session;
  @service currentSession;
  @service fileService;
  @service router;
  @service metrics;
  @service userAgent;

  constructor() {
    super(...arguments);
    this.setupTracking();
  }

  async beforeModel() {
    this.moment.setLocale('nl');
    this.moment.defaultFormat = 'DD.MM.YYYY';
    this.moment.allowEmpty = true;
    this.intl.setLocale(['nl-be']);

    if (!this.isSupportedBrowser) {
      this.router.transitionTo('not-supported');
    }

    try {
      await this.currentSession.load();
    } catch (error) { // eslint-disable-line no-unused-vars
      this.session.invalidate();
    }

    if (this.session.isAuthenticated && !this.currentSession.hasValidGroup) {
      this.router.transitionTo('accountless-users');
    }

    await this.store.query('meeting-kind', {
      'page[size]': PAGE_SIZE.MEETING_KIND,
      filter: {
        ':has:priority': true, // There is an ext:MinisterraadType resource called Annex which we don't want to show in dropdowns. It does not have an ext:priority property, so we use that fact to filter it out
      },
      sort: 'priority',
    });
  }

  get isSupportedBrowser() {
    const browser = this.userAgent.browser;
    return (window.Cypress
      || browser.isFirefox
      || browser.isChrome
      || browser.isSafari
      || browser.isChromeHeadless); // Headless in order not to break automated tests.
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
    if (this.session.isAuthenticated && !this.currentSession.hasValidGroup) {
      this.router.transitionTo('accountless-users');
    }

    if (
      this.fileService.get('deleteDocumentContainerWithUndo.isRunning')
        && confirm(this.intl.t('leave-page-message'))
    ) {
      transition.abort();
    }
  }
}
