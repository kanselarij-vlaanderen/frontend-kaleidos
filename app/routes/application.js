import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { setDefaultOptions } from 'date-fns';
import { nlBE } from 'date-fns/locale';


export default class ApplicationRoute extends Route {
  @service conceptStore;
  @service moment;
  @service intl;
  @service session;
  @service currentSession;
  @service fileService;
  @service router;
  @service userAgent;

  async beforeModel() {
    // Set default locale for date-fns
    setDefaultOptions({ locale: nlBE });

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

    if (this.session.isAuthenticated && !this.currentSession.hasAccessToApplication) {
      this.transitionTo('accountless-users');
    }

    // Fire and forget these two calls so we load in the concepts without blocking loading of the routes
    // These calls are pre-loaded in the cache by the cache-warmup-service so they should be quite quick to resolve
    this.conceptStore.queryAllByConceptScheme(CONSTANTS.CONCEPT_SCHEMES.VERGADERACTIVITEIT, {
      'filter[:has-no:narrower]': true,
      include: 'broader',
    });
    this.conceptStore.queryAllByConceptScheme(CONSTANTS.CONCEPT_SCHEMES.ACCESS_LEVELS);
  }

  get isSupportedBrowser() {
    const browser = this.userAgent.browser;
    return (window.Cypress
      || browser.isFirefox
      || browser.isChrome
      || browser.isSafari
      || browser.isChromeHeadless); // Headless in order not to break automated tests.
  }

  @action
  willTransition(transition) {
    if (this.session.isAuthenticated && !this.currentSession.hasAccessToApplication) {
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
