import Route from '@ember/routing/route';
import DataTableRouteMixin from 'ember-data-table/mixins/route';
import { isEmpty } from '@ember/utils';
import moment from 'moment';
import search from '../../utils/mu-search';

export default Route.extend(DataTableRouteMixin, {
  queryParams: {
    isArchived: {
      refreshModel: true
    },
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
    decisionsOnly: {
      refreshModel: true,
      type: 'boolean'
    },
    size: {
      refreshModel: true
    },
    page: {
      refreshModel: true
    },
  },

  textSearchFields: Object.freeze(['title', 'shortTitle', 'data', 'subcaseTitle', 'subcaseSubTitle']),

  isLoading: false,

  postProcessDates: function (_case) {
    const sessionDates = _case.attributes.sessionDates;
    if (sessionDates) {
      if (Array.isArray(sessionDates)) {
        const sorted = sessionDates.sort();
        _case.attributes.sessionDates = sorted[sorted.length - 1];
      } else {
        _case.attributes.sessionDates = moment(sessionDates);
      }
    }
  },

  async model(params) {
    const searchModifier = ':sqs:';
    const textSearchKey = this.textSearchFields.join(',');

    const filter = {};

    let searchDocumentType = params.decisionsOnly ? 'casesByDecisionText' : 'cases';

    if (!isEmpty(params.searchText)) {
      filter[searchModifier + textSearchKey] = params.searchText;
    }

    if (!isEmpty(params.mandatees)) {
      filter['creators,mandatees'] = params.mandatees;
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

    // Param below not yet in use, since it isn't indexed
    // if (params.isArchived) {
    //   filter['isArchived'] = 'true';
    // }

    if (Object.keys(filter).length == 0) {
      filter[searchModifier + textSearchKey] = '*'; // search without filter
    }

    const that = this;
    return search(searchDocumentType, params.page, params.size, params.sort, filter, function (item) {
      const entry = item.attributes;
      entry.id = item.id;
      that.postProcessDates(item);
      return entry;
    });
  },

  actions: {
    refreshModel() {
      this.refresh();
    },
  },
});
