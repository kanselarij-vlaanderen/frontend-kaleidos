import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class IndexSearchRoute extends Route {
  @service currentSession;
  @service router

  beforeModel() {
    /* It is assumed here that explicitly navigating to the index-route
     * expresses a desire to "reset", to "start a new search-session".
     * Therefore all parameters except filters -such as "type" of agenda-item- are cleared.
     * We assume that those (checkbox-like) filters are specific to the user/session
     * and therefore are desired to be persisted. */
    /* TODO: If you go through this transition when already in a search (sub-) route, the queryParams
     * in the url get reset as requested, but you don't go through the model/setupController-hook
     * of the "search" route, even though the queryParams are marked `refreshModel: true`.
     * As a result "searchTextBuffer" doesn't get cleared.
     */
    const queryParams = {
      searchText: null,
      mandatees: null,
      dateFrom: null,
      dateTo: null,
      page: 0,
    }
    // ovrb users get directed to publication search
    if (this.currentSession.isOvrb) {
      return this.router.transitionTo('search.publication-flows', {
        queryParams: queryParams,
      });
    }
    this.router.transitionTo('search.agenda-items', {
      queryParams: queryParams,
    });
  }
}
