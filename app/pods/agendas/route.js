import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
// eslint-disable-next-line ember/no-mixins
import DataTableRouteMixin from 'ember-data-table/mixins/route';

export default class AgendasRoute extends Route.extend(DataTableRouteMixin) {
  @service store;
  @service router;
  @service('session') simpleAuthSession;

  modelName = 'agenda';

  queryParams = {
    from: {
      refreshModel: true,
    },
    to: {
      refreshModel: true,
    },
    page: {
      refreshModel: true,
    },
    size: {
      refreshModel: true,
    },
    sort: {
      refreshModel: true,
    },
  };

  mergeQueryOptions(params) {
    const options = {
      'filter[:has-no:next-version]': true,
      sort: '-status,created-for.planned-start',
    };
    if (params.from) {
      options['filter[created-for][:gte:planned-start]'] = params.from;
    }
    if (params.to) {
      options['filter[created-for][:lte:planned-start]'] = params.to;
    }
    if (params.sort && !params.sort.includes('-status')) {
      options['sort'] = '-status,' + params.sort;
    }

    return options;
  };

  beforeModel(transition) {
    this.simpleAuthSession.requireAuthentication(transition, 'login');
  }

  @action
  loading(transition) {
    // see snippet in https://api.emberjs.com/ember/3.27/classes/Route/events/loading?anchor=loading
    // eslint-disable-next-line ember/no-controller-access-in-routes
    const controller = this.controllerFor(this.routeName);
    controller.set('isLoadingModel', true);
    transition.promise.finally(() => {
      controller.set('isLoadingModel', false);
    });

    // only bubble loading event when transitioning between tabs
    // to enable loading template to be shown
    if (transition.from && transition.to) {
      return transition.from.name != transition.to.name;
    } else {
      return true;
    }
  }

  @action
  refreshRoute() {
    this.refresh();
  }
}
