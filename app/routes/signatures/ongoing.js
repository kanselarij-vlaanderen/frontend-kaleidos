import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import Snapshot from 'frontend-kaleidos/utils/snapshot';
import { isPresent } from '@ember/utils';
import parseDate from 'frontend-kaleidos/utils/parse-date-search-param';
import startOfDay from 'date-fns/startOfDay';
import endOfDay from 'date-fns/endOfDay';

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

  constructor() {
    super(...arguments);
    this.lastParams = new Snapshot();
  }

  async model(params) {
    this.lastParams.stageLive(params);

    if (
      this.lastParams.anyFieldChanged(
        Object.keys(params).filter((key) => key !== 'page')
      )
    ) {
      params.page = 0;
    }

    const filter = { ':has-no:meeting': true };
    if (this.currentSession.may('view-all-ongoing-signatures')) {
      filter[':has:creator'] = 't';
    } else {
      // User has a common organisation with the creator of the flow
      filter['creator'] = {
        memberships: {
          organization: {
            ':id:': this.currentSession.organization.id,
          }
        },
      };
    }

    filter['decision-activity'] = {};
    if (params.mandatees?.length > 0) {
      filter['decision-activity'] = {
        subcase: {
          'requested-by': {
            person: {
              ':id:': params.mandatees.join(','),
            },
          },
        },
      };
    }
    if (params.statuses?.length > 0) {
      filter['status'] = {
        ':id:': params.statuses.join(','),
      };
    }

    if (isPresent(params.dateFrom)) {
      const date = startOfDay(parseDate(params.dateFrom));
      filter['decision-activity'][':gte:start-date'] = date.toISOString().slice(0, 10);
    }
    if (isPresent(params.dateTo)) {
      const date = endOfDay(parseDate(params.dateTo));
      filter['decision-activity'][':lte:start-date'] = date.toISOString().slice(0, 10);
    }

    this.lastParams.commit();

    return this.store.query('sign-flow', {
      'filter[sign-subcase][sign-marking-activity][:has:piece]': 'yes',
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
    if (transition.from && transition.to) {
      return transition.from.name != transition.to.name;
    } else {
      return true;
    }
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    if (controller.page !== this.lastParams.committed.page) {
      controller.page = this.lastParams.committed.page;
    }
    controller.mandatees = this.lastParams.committed.mandatees;
    controller.statuses = this.lastParams.committed.statuses;
  }
}
