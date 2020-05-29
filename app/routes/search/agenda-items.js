import Route from '@ember/routing/route';
import { isEmpty } from '@ember/utils';
import moment from 'moment';
import search from '../../utils/mu-search';
import DataTableRouteMixin from 'ember-data-table/mixins/route';

export default class CasesSearchRoute extends Route.extend(DataTableRouteMixin) {
  queryParams = {
    types: {
      refreshModel: true,
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

  textSearchFields = Object.freeze(['title', 'shortTitle', 'data', 'titlePress', 'textPress']);

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

    const searchModifier = ':sqs:';
    const textSearchKey = this.textSearchFields.join(',');

    const filter = {};

    if (!isEmpty(searchParams.searchText)) {
      filter[`${searchModifier}${textSearchKey}`] = searchParams.searchText;
    }
    if (!isEmpty(searchParams.mandatees)) {
      filter['mandateeName,mandateeFirstNames,mandateeFamilyNames'] = searchParams.mandatees;
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

    if (params.types.length) {
      if (params.types.includes('nota') && !params.types.includes('mededeling')) {
        filter['showAsAnnouncement'] = false;
      } else if (params.types.includes('mededeling') && !params.types.includes('nota')) {
        filter['showAsAnnouncement'] = true;
      }
    }

    if (Object.keys(filter).length == 0) {
      filter[':sqs:title'] = '*'; // search without filter
    }

    return search('agendaitems', params.page, params.size, params.sort, filter, function (item) {
      const entry = item.attributes;
      entry.id = item.id;
      return entry;
    });
  }
}
