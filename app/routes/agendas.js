import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class AgendasRoute extends Route {
  @service store;
  @service('session') simpleAuthSession;

  dateRegex = /^(?:(\d{1,2})[/-])??(?:(\d{1,2})[/-])?(\d{4})$/;

  queryParams = {
    filterAgendas: {
      refreshModel: true,
    },
    pageAgendas: {
      refreshModel: true,
    },
    sizeAgendas: {
      refreshModel: true,
    },
    sortAgendas: {
      refreshModel: true,
    },
  };

  beforeModel(transition) {
    this.simpleAuthSession.requireAuthentication(transition, this.simpleAuthSession.unauthenticatedRouteName);
  }

  async model(params) {
    const queryParams = {
      sort: params.sortAgendas,
      page: {
        number: params.pageAgendas,
        size: params.sizeAgendas,
      },
      include: 'status,created-for,created-for.kind',
      'filter[:has-no:next-version]': true,
    };

    if (params.filterAgendas) {
      const date = params.filterAgendas.split('/').join('-');
      const match = this.dateRegex.exec(date);

      if (match) {
        const [, day, month, year] = match.map(num => parseInt(num, 10));
        const from = new Date(year, (month - 1) || 0, day || 1);
        const to = new Date(from);
        if (day) {
          to.setDate(day + 1);
        } else if (month) {
          to.setMonth(month); // months are 0-indexed, no +1 required
        } else {
          to.setYear(year + 1);
        }

        queryParams['filter[created-for][:gte:planned-start]'] = from.toISOString();
        queryParams['filter[created-for][:lte:planned-start]'] = to.toISOString();
      }
    }

    return await this.store.query('agenda', queryParams);
  }

  async afterModel() {
    this.defaultPublicationActivityStatus = await this.store.findRecordByUri('concept', CONSTANTS.RELEASE_STATUSES.PLANNED);
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.defaultPublicationActivityStatus = this.defaultPublicationActivityStatus;
  }

  @action
  loading(transition) {
    // eslint-disable-next-line ember/no-controller-access-in-routes
    const controller = this.controllerFor(this.routeName);
    controller.isLoadingModel = true;
    transition.promise.finally(() => {
      controller.isLoadingModel = false;
    });

   // only bubble loading event when transitioning between tabs
   // to enable loading template to be shown
   if (transition.from && transition.to) {
     return transition.from.name != transition.to.name;
   } else {
     return true;
   }
  }
}
