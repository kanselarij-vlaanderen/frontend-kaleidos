import Route from '@ember/routing/route';
import DataTableRouteMixin from 'ember-data-table/mixins/route';
import { isEmpty } from '@ember/utils';
import moment from 'moment';
import search from '../../utils/mu-search';

export default Route.extend(DataTableRouteMixin, {
  queryParams: {
    searchText: {
      refreshModel: true,
      as: 'zoekterm'
    },
    mandatees: {
      refreshModel: true
    },
    dateFrom: {
      refreshModel: true,
      as: 'vanaf'
    },
    dateTo: {
      refreshModel: true,
      as: 'tot'
    },
    announcementsOnly: {
      refreshModel: true,
      type: 'boolean',
    },
    size: {
      refreshModel: true
    },
    page: {
      refreshModel: true
    }
  },

  model(params) {
    const filter = {};

    if (!isEmpty(params.searchText)) {
      const textSearchFields = ['title', 'data', 'shortTitle', 'titlePress', 'textPress'].join(',');
      filter[`:sqs:${textSearchFields}`] = params.searchText;
    }
    if (!isEmpty(params.mandatees)) {
      filter['mandateeName,mandateeFirstNames,mandateeFamilyNames'] = params.mandatees;
    }

    /* A closed range is treated as something different than 2 open ranges because
     * mu-search(/elastic?) (semtech/mu-search:0.6.0-beta.11, semtech/mu-search-elastic-backend:1.0.0)
     * returns an off-by-one result (1 to many) in case of two open ranges combined.
     */
    if (!isEmpty(params.dateFrom) && !isEmpty(params.dateTo)) {
      const from = moment(params.dateFrom, "DD-MM-YYYY").startOf('day');
      const to = moment(params.dateTo, "DD-MM-YYYY").endOf('day');  // "To" interpreted as inclusive
      filter[':lte,gte:sessionDates'] = [to.utc().toISOString(),from.utc().toISOString()].join(',');
    } else if (!isEmpty(params.dateFrom)) {
      const date = moment(params.dateFrom, "DD-MM-YYYY").startOf('day');
      filter[':gte:sessionDates'] = date.utc().toISOString();
    } else if (!isEmpty(params.dateTo)) {
      const date = moment(params.dateTo, "DD-MM-YYYY").endOf('day');  // "To" interpreted as inclusive
      filter[':lte:sessionDates'] = date.utc().toISOString();
    }

    if (params.announcementsOnly) {
      filter['showAsAnnouncement'] = true;
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
});
