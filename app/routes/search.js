import Route from '@ember/routing/route';

export default class SearchRoute extends Route {
  queryParams = {
    searchText: {
      refreshModel: true,
      as: 'zoekterm'
    },
    mandatees: {
      refreshModel: true,
      as: 'minister'
    },
    dateFrom: {
      refreshModel: true,
      as: 'vanaf'
    },
    dateTo: {
      refreshModel: true,
      as: 'tot'
    }
  };

  setupController(controller, model) {
    super.setupController(controller, model);
    const params = this.paramsFor('search')
    controller.searchTextBuffer = params.searchText;
    controller.mandateesBuffer = params.mandatees;
    controller.dateFromBuffer = controller.deserializeDate(params.dateFrom);
    controller.dateToBuffer = controller.deserializeDate(params.dateTo);
  }
}
