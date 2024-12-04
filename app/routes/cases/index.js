import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { startOfDay, endOfDay } from 'date-fns';
import parseDate from 'frontend-kaleidos/utils/parse-date-search-param';
// import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class CasesIndexRoute extends Route {
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
    caseFilter: {
      refreshModel: true,
      as: 'dossier_naam',
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
      as: 'indieners'
    },
    noDefinitivePresent: {
      refreshModel: true,
      as: 'enkel_zonder_definitieve',
    },
  };

  model(params) {
    const options = {
      include: 'decisionmaking-flow',
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
    };

    if (params.caseFilter) {
      options['filter[short-title]'] = params.caseFilter;
    }

    options['filter[:has:decisionmaking-flow]'] = true;
    options['filter[decisionmaking-flow][:has-no:closed]'] = true;

    if (isPresent(params.dateFrom)) {
      const date = startOfDay(parseDate(params.dateFrom));
      options['filter[:gte:created]'] = date.toISOString();
    }
    if (isPresent(params.dateTo)) {
      const date = endOfDay(parseDate(params.dateTo));
      options['filter[:lte:created]'] = date.toISOString();
    }

    if (isPresent(params.submitters)) {
      options[
        'filter[decisionmaking-flow][subcases][requested-by][person][:id:]'
      ] = params.submitters.join(',');
    }

    // We should filter on "not exists" of CONSTANTS.SUBCASE_TYPES.DEFINITIEVE_GOEDKEURING, which is not possible in ember I think.
    // we would need post filtering (which will mess with the meta count and make pagination difficult) or do like a shortlist instead.
    if (params.noDefinitivePresent) {
      // this could be it, but the problem is that the righthand value does not matter with a :has-no:. it will assume any text as
      // "apply the filter 'FILTER NOT EXISTS ?subcase ?predicate ?type"
      // options['filter[decisionmaking-flow][subcases][:has-no:type]'] = CONSTANTS.SUBCASE_TYPES.DEFINITIEVE_GOEDKEURING;
    }

    return this.store.query('case', options);
  }

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
