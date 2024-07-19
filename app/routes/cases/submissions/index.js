import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { startOfDay, endOfDay } from 'date-fns';
// import CONSTANTS from 'frontend-kaleidos/config/constants';
import parseDate from 'frontend-kaleidos/utils/parse-date-search-param';

export default class CasesSubmissionsIndexRoute extends Route {
  @service currentSession;
  @service conceptStore;
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
      as: 'indieners',
    },
  };

  async model(params) {
    // const statusIds = (
    //   await this.conceptStore.queryAllByConceptScheme(
    //     CONSTANTS.CONCEPT_SCHEMES.SUBMISSION_STATUSES
    //   )
    // ).map((status) => status.id);
    const options = {
      'filter[:has:created]': `date-added-for-cache-busting-${new Date().toISOString()}`,
      // 'filter[status][:id:]': statusIds.join(','), // TODO: update (BIS) submissions are not shown for some reason
      'filter[:has-no:submission-activities]': 't',
      include: 'type,status,requested-by,mandatees.person,being-treated-by,submission-activities',
      sort: params.sort + ',-modified',
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
}