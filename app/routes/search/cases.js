import Route from '@ember/routing/route';
import { isEmpty } from '@ember/utils';
import moment from 'moment';
import search from '../../utils/mu-search';
import DataTableRouteMixin from 'ember-data-table/mixins/route';

export default class CasesSearchRoute extends Route.extend(DataTableRouteMixin) {
  queryParams = {
    // isArchived: {
    //   refreshModel: true
    // },
    decisionsOnly: {
      refreshModel: true,
      as: 'enkel_beslissingen'
    },
    page: {
      refreshModel: true,
      as: 'pagina'
    },
    size: {
      refreshModel: true,
      as: 'aantal'
    },
    sort: {
      refreshModel: true,
      as: 'sorteer'
    }
  };

  textSearchFields = Object.freeze(['title', 'shortTitle', 'data', 'subcaseTitle', 'subcaseSubTitle']);

  postProcessDates (_case) {
    const sessionDates = _case.attributes.sessionDates;
    if (sessionDates) {
      if (Array.isArray(sessionDates)) {
        const sorted = sessionDates.sort();
        _case.attributes.sessionDates = sorted[sorted.length - 1];
      } else {
        _case.attributes.sessionDates = moment(sessionDates);
      }
    }
  }

  model(params) {
    const searchParams = this.paramsFor('search');

    if (isEmpty(searchParams.searchText)) {
      return [];
    }

    const searchModifier = ':sqs:';
    const textSearchKey = this.textSearchFields.join(',');

    const filter = {};

    let searchDocumentType = params.decisionsOnly ? 'casesByDecisionText' : 'cases';

    if (!isEmpty(searchParams.searchText)) {
      filter[searchModifier + textSearchKey] = searchParams.searchText;
    }

    if (!isEmpty(searchParams.mandatees)) {
      filter['creators,mandatees'] = searchParams.mandatees;
    }

    /* A closed range is treated as something different than 2 open ranges because
     * mu-search(/elastic?) (semtech/mu-search:0.6.0-beta.11, semtech/mu-search-elastic-backend:1.0.0)
     * returns an off-by-one result (1 to many) in case of two open ranges combined.
     */
    if (!isEmpty(searchParams.dateFrom) && !isEmpty(searchParams.dateTo)) {
      const from = moment(searchParams.dateFrom, "DD-MM-YYYY").startOf('day');
      const to = moment(searchParams.dateTo, "DD-MM-YYYY").endOf('day');  // "To" interpreted as inclusive
      filter[':lte,gte:sessionDates'] = [to.utc().toISOString(),from.utc().toISOString()].join(',');
    } else if (!isEmpty(searchParams.dateFrom)) {
      const date = moment(searchParams.dateFrom, "DD-MM-YYYY").startOf('day');
      filter[':gte:sessionDates'] = date.utc().toISOString();
    } else if (!isEmpty(searchParams.dateTo)) {
      const date = moment(searchParams.dateTo, "DD-MM-YYYY").endOf('day');  // "To" interpreted as inclusive
      filter[':lte:sessionDates'] = date.utc().toISOString();
    }

    // Param below not yet in use, since it isn't indexed
    // if (this.isArchived) {
    //   filter['isArchived'] = 'true';
    // }

    const { postProcessDates } = this;
    return search(searchDocumentType, params.page, params.size, params.sort, filter, function (item) {
      const entry = item.attributes;
      entry.id = item.id;
      postProcessDates(item);
      return entry;
    });
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.emptySearch = isEmpty(this.paramsFor('search').searchText);
  }
}
