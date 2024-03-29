import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class IndexSearchRoute extends Route {
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
    // We have to mention the arrays or we run into the problem that clicking multiple times
    // results in these arrays being transformed to strings "[]"
    const queryParams = {
      searchText: null,
      mandatees: null,
      governmentAreas: null,
      dateFrom: null,
      dateTo: null,
      page: 0,
    }
    this.router.transitionTo('search.all-types', {
      queryParams: queryParams,
    });
  }
}
