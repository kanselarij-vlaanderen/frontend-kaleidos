import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';

export default class ApplicationRoute extends Route {
  @service store;
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
    this.moment.setLocale('nl-be');

    this.intl.setLocale(['nl-be']);

    if (!this.isSupportedBrowser) {
      this.transitionTo('not-supported');
    }

    try {
      await this.currentSession.load();
    } catch (error) { // eslint-disable-line no-unused-vars
      this.session.invalidate();
    }

    if (this.session.isAuthenticated && !this.currentSession.hasValidGroup) {
      this.transitionTo('accountless-users');
    }

    await this.store.query('concept', {
      filter: {
        'concept-schemes': {
          ':uri:': CONSTANTS.CONCEPT_SCHEMES.VERGADERACTIVITEIT,
        },
        ':has-no:narrower': true, // Only the most specific concepts, i.e. the actual meeting kinds (so no "Annex")
      },
      include: 'broader,narrower',
      'page[size]': PAGE_SIZE.CODE_LISTS,
      sort: 'position',
    });

    await this.store.query('concept', {
      filter: {
        'concept-schemes': {
          ':uri:': CONSTANTS.CONCEPT_SCHEMES.ACCESS_LEVELS,
        },
      },
      'page[size]': PAGE_SIZE.CODE_LISTS,
      sort: 'position',
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
      this.transitionTo('accountless-users');
    }

    if (
      this.fileService.get('deleteDocumentContainerWithUndo.isRunning')
        && !confirm(this.intl.t('leave-page-message'))
    ) {
      transition.abort();
    }
  }
}
