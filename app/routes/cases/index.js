import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { startOfDay, endOfDay } from 'date-fns';
import parseDate from 'frontend-kaleidos/utils/parse-date-search-param';
import Route from '@ember/routing/route';

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
    showArchivedOnly: {
      refreshModel: true,
      as: 'toon_enkel_gearchiveerd',
    },
    dateFrom: {
      refreshModel: true,
      as: 'van',
    },
    dateTo: {
      refreshModel: true,
      as: 'tot',
    },
    nameSearchText: {
      refreshModel: true,
      as: 'dossier_naam',
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

    if (params.nameSearchText) {
      options['filter[short-title]'] = params.nameSearchText;
    }

    options['filter[:has:decisionmaking-flow]'] = true;

    if (isPresent(params.dateFrom)) {
      const date = startOfDay(parseDate(params.dateFrom));
      options['filter[:gte:created]'] = date.toISOString();
    }
    if (isPresent(params.dateTo)) {
      const date = endOfDay(parseDate(params.dateTo));
      options['filter[:lte:created]'] = date.toISOString();
    }

    // if (this.personFilter) {
    //   options[
    //     'filter[decisionmaking-flow][subcases][requestedBy][person][:id:]'
    //   ] = null; // [lijst met ids]
    // }

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
    return true;
  }
}
