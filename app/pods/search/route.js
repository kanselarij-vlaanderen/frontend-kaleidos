import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class SearchRoute extends Route {
  @service('session') simpleAuthSession;

  queryParams = {
    searchText: {
      refreshModel: true,
      as: 'zoekterm',
    },
    mandatees: {
      refreshModel: true,
      as: 'minister',
    },
    dateFrom: {
      refreshModel: true,
      as: 'vanaf',
    },
    dateTo: {
      refreshModel: true,
      as: 'tot',
    },
    /* As a temporary solution, a publication-flow tab was added to the main
     * "search" menu. For this specific case, instead of being able to filter
     * on date range, it was spec'ed to be able to filter on 1 specific date.
     * A selector was added, allowing to specify on which of the many dates that are
     * relevant during the publication process the filter must be scoped
     */
    date: {
      refreshModel: true,
      as: 'datum',
    },
    publicationDateTypeKey: {
      refreshModel: true,
      as: 'datum_type',
    },
  };

  beforeModel(transition) {
    this.simpleAuthSession.requireAuthentication(transition, 'login');
  }

  /* There is no reset of query parameters here by means of "resetController".
   * It is assumed that -unless users explicitly click the main "search" button-
   * search state (term, page number, ...) should be remembered, especially with
   * a trial-and-error search-session in mind, where users navigate to a detail item,
   * realize it's not what they're looking for and go back in history.
   */

  setupController(controller, model) {
    super.setupController(controller, model);
    const params = this.paramsFor('search');
    controller.searchTextBuffer = params.searchText;
    controller.mandateesBuffer = params.mandatees;
    controller.page = params.page;
    controller.dateFromBuffer = controller.deserializeDate(params.dateFrom);
    controller.dateToBuffer = controller.deserializeDate(params.dateTo);
    controller.dateBuffer = controller.deserializeDate(params.date);
  }

  @action
  loading(/*transition, originRoute*/) {
    // Disable bubbling of loading event to prevent parent loading route to be shown.
    // Otherwise it causes a 'flickering' effect because the search filters disappear.
    return false;
  }
}
