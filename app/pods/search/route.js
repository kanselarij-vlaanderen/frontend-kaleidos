import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

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
  }
}
