import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { startOfDay, endOfDay } from 'date-fns';
// import CONSTANTS from 'frontend-kaleidos/config/constants';
import parseDate from 'frontend-kaleidos/utils/parse-date-search-param';

export default class SubmissionsRoute extends Route {
  @service currentSession;
  @service conceptStore;
  @service store;
  @service router;
  @service('session') simpleAuthSession;

  queryParams = {
    page: {
      refreshModel: true,
      as: 'pagina',
    },
    size: {
      refreshModel: true,
      as: 'aantal',
    },
    sortSubmissions: {
      refreshModel: true,
      as: 'sorteer',
    },
    dateFrom: {
      refreshModel: true,
      as: 'van',
    },
    dateTo: {
      refreshModel: true,
      as: 'tot',
    },
    submitters: {
      refreshModel: true,
      as: 'indieners',
    },
  };

  async beforeModel(transition) {
    this.simpleAuthSession.requireAuthentication(transition, this.simpleAuthSession.unauthenticatedRouteName);

    if (!this.currentSession.may('view-submissions')) {
      this.router.transitionTo('cases.index');
    }
  }

  async model(params) {
    // *note: the cache busting delays the loading a bit, even locally with only 2 submissions it take half a second
    const options = {
      'filter[:has:created]': `date-added-for-cache-busting-${new Date().toISOString()}`,
      'filter[:has:pieces]': 't',
      'filter[pieces][accepted-piece][agendaitems][agenda][created-for][:has-no:agenda]': 't', // filter out submissions on closed meetings
      include: 'type,status,requested-by,mandatees.person,submission-activities,decisionmaking-flow',
      sort: params.sortSubmissions + (params.sortSubmissions ? ',' : '') + '-modified',
      page: {
        number: params.page,
        size: params.size,
      },
    };

    if (isPresent(params.dateFrom)) {
      const date = startOfDay(parseDate(params.dateFrom));
      options['filter[:gte:planned-start]'] = date.toISOString();
    }
    if (isPresent(params.dateTo)) {
      const date = endOfDay(parseDate(params.dateTo));
      options['filter[:lte:planned-start]'] = date.toISOString();
    }

    if (isPresent(params.submitters)) {
      const submitters = Array.isArray(params.submitters)
        ? params.submitters.join(',')
        : params.submitters || '';
      options['filter[requested-by][person][:id:]'] = submitters;
    }

    if (!this.currentSession.may('view-all-submissions')) {
      options['filter[mandatees][user-organizations][:id:]'] =
        this.currentSession.organization.id;
    }

    return this.store.query('submission', options);
  }

  // when filtering on date, show a loader
  @action
  loading(transition) {
    // eslint-disable-next-line ember/no-controller-access-in-routes
    const controller = this.controllerFor(this.routeName);
    controller.isLoadingModel = true;
    transition.promise.finally(() => {
      controller.isLoadingModel = false;
    });
    // false so we don't transition to the loading route when searching
    if (transition.from && transition.to) {
      return transition.from.name != transition.to.name;
    } else {
      return false;
    }
  }
}
