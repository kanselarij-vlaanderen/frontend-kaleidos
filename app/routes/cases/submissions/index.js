import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { startOfDay, endOfDay } from 'date-fns';
import parseDate from 'frontend-kaleidos/utils/parse-date-search-param';

export default class CasesSubmissionsIndexRoute extends Route {
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
  };

  model(params) {
    const options = {
      include: 'type,status,requested-by,mandatees.person,being-treated-by',
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      }
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
      options[
        'filter[requested-by][person][:id:]'
      ] = params.submitters.join(',');
    }


    if (!this.currentSession.may('view-all-submissions')) {
      options[
        'filter[requested-by][user-organizations][:id:]'
      ] = this.currentSession.organization.id;
    }

    return this.store.query('submission', options);
  }
}
