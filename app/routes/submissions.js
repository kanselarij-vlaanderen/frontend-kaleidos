import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { startOfDay, endOfDay } from 'date-fns';
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

  // We only want to load the defaults once. Changes made after stay untill all checkboxes are cleared.
  loadedDefaults = false;

  async beforeModel(transition) {
    this.simpleAuthSession.requireAuthentication(transition, this.simpleAuthSession.unauthenticatedRouteName);

    if (!this.currentSession.may('view-submissions')) {
      this.router.transitionTo('cases.index');
    }
    // minister profile can see all but we will check their mandatee by default
    // admin profile can see all by default.
    // we only try this once
    if (this.currentSession.may('view-all-submissions') && (!this.currentSession.may('treat-and-accept-submissions')) && !this.loadedDefaults) {
      const currentUserOrganization = await this.currentSession.organization;
      const currentUserOrganizationMandatees = await currentUserOrganization.mandatees;
      const submitters = await Promise.all(
        currentUserOrganizationMandatees?.map((m) => m.person)
      );
      this.submittersIds = await Promise.all(
        submitters?.map((m) => m.id)
      );
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

    // empty list in case all checkboxes become unchecked
    this.submitters = [];
    if (isPresent(params.submitters)) {
      const submitters = Array.isArray(params.submitters)
        ? params.submitters.join(',')
        : params.submitters || '';
      options['filter[requested-by][person][:id:]'] = submitters;
      this.submitters = Array.isArray(params.submitters) ? params.submitters : [params.submitters];
    } else if (this.submittersIds?.length && !this.loadedDefaults) {
      // We can hit this in 2 occasions: when loading the page or when deselecting all boxes.
      // in the first case, controller is not yet loaded and will use the value we passed with setupController
      // in the latter case, controller is already created, ministerfilter has been created and side effects occur with the defaults.
      // only setting the defaults once.
      this.loadedDefaults = true;
      const submitters = [...this.submittersIds].join(',');
      options['filter[requested-by][person][:id:]'] = submitters;
      this.submitters = this.submittersIds;
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

  setupController(controller) {
    super.setupController(...arguments);
    controller.submitters = this.submitters;
  }
}
