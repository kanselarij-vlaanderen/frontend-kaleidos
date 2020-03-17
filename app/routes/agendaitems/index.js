import Route from '@ember/routing/route';
import DataTableRouteMixin from 'ember-data-table/mixins/route';
import { isEmpty } from '@ember/utils';
import search from '../../utils/mu-search';

export default Route.extend(DataTableRouteMixin, {
  queryParams: {
    searchText: {
      refreshModel: true
    },
    mandatees: {
      refreshModel: true
    },
    dateFrom: {
      refreshModel: true
    },
    dateTo: {
      refreshModel: true
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
      filter[':gte:sessionDates'] = params.dateFrom;
    }
    if (!isEmpty(params.dateTo)) {
      filter[':lte:sessionDates'] = params.dateTo;
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
