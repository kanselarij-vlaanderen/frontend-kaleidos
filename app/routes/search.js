import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import parseDate from '../utils/parse-date-search-param';

export default class SearchRoute extends Route {
  @service('session') simpleAuthSession;

  queryParams = {
    searchText: {
      refreshModel: true,
      as: 'zoekterm',
    },
    mandatees: {
      refreshModel: true,
      as: 'ministers',
    },
    dateFrom: {
      refreshModel: true,
      as: 'van',
    },
    dateTo: {
      refreshModel: true,
      as: 'tot',
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
    controller.mandatees = params.mandatees;
    controller.page = params.page;
    controller.dateFromBuffer = parseDate(params.dateFrom);
    controller.dateToBuffer = parseDate(params.dateTo);
  }

  @action
  loading(/*transition, originRoute*/) {
    // Disable bubbling of loading event to prevent parent loading route to be shown.
    // Otherwise it causes a 'flickering' effect because the search filters disappear.
    return false;
  }
}
