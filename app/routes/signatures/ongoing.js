import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class SignaturesOngoingRoute extends Route {
  @service currentSession;
  @service store;

  queryParams = {
    page: {
      refreshModel: true,
      as: 'pagina',
    },
    size: {
      refreshModel: true,
      as: 'aantal',
    },
    sort: {
      refreshModel: true,
      as: 'sorteer',
    },
    mandatees: {
      refreshModel: true,
      as: 'indieners',
    },
    statuses: {
      refreshModel: true,
      as: 'statussen',
    }
  };

  constructor() {
    super(...arguments);
  }

  async model(params) {
    let filter = {
      creator: {
        ':id:': this.currentSession.user.id,
      },
    }
    if (params.mandatees?.length > 0) {
      filter['decision-activity'] = {
        'subcase': {
          'requested-by': {
            'person': {
              ':id:': params.mandatees.join(','),
            }
          }
        }
      }
    }
    if (params.statuses?.length > 0) {
      filter['status'] = {
        ':uri:': params.statuses.join(','),
      }
    }
    return this.store.query('sign-flow', {
      filter: filter,
      include: [
        'creator',
        'decision-activity',
        'sign-subcase.sign-marking-activity.piece.document-container.type',
        'status',
        // 'sign-subcase.sign-signing-activities.mandatee.person',
      ].join(','),
      page: {
        number: params.page,
        size: params.size,
      },
      sort: params.sort,
    });
  }

  @action
  loading(transition) {
    // eslint-disable-next-line ember/no-controller-access-in-routes
    const controller = this.controllerFor(this.routeName);
    controller.isLoadingModel = true;
    transition.promise.finally(() => {
      controller.isLoadingModel = false;
    });
    // Disable bubbling of loading event to prevent parent loading route to be shown.
    // Otherwise it causes a 'flickering' effect because the search filters disappear.
    if (transition.from && transition.to && transition.queryParamsOnly) {
      return transition.from.queryParams?.filter === transition.to.queryParams?.filter;
    } else {
      return true;
    }
  }
}
