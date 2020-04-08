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
    if (!isEmpty(params.dateFrom)) {
      const date = moment(params.dateFrom, "DD-MM-YYYY").startOf('day');
      filter[':gte:sessionDates'] = date.utc().toISOString();
    }
    if (!isEmpty(params.dateTo)) {
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
