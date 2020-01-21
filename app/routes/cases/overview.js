import Route from '@ember/routing/route';
import DataTableRouteMixin from 'ember-data-table/mixins/route';
import { isEmpty } from '@ember/utils';
import { inject as service } from '@ember/service';
import moment from 'moment';

export default Route.extend(DataTableRouteMixin, {
  modelName: 'case',
  muSearch: service(),

  queryParams: {
    isArchived: {
      refreshModel: true
    },
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

  mergeQueryOptions(params) {
    let filter = {};
    filter['is-archived'] = params.isArchived;
    return {
      filter: filter,
    };
  },

  wantsFilteredResults(params) {
    return !isEmpty(params.searchText);
  },

  postProcessDates: function(_case) {
    const sessionDates = _case.get('sessionDates');
    if (sessionDates) {
      if (Array.isArray(sessionDates)) {
        const moments = sessionDates.map(sessionDate => moment(sessionDate));
        _case.set('sessionDates', moments[moments.length - 1]);
      } else {
        _case.set('sessionDates', moment(sessionDates));
      }
    }
  },

  async model(params) {
    let that = this;
    const searchModifier = ':sqs:';
    if (!this.wantsFilteredResults(params)) {
      return this._super(...arguments);
    }
    const textSearchKey = this.textSearchFields.join(',');
    let queryParams = {
      filter: {
        // 'is-archived': params.isArchived // Cannot post-filter on mu-cl-resources. field MUST be included in search-object keys
      },
      page: {
        size: params.size,
        number: params.page
      },
      sort: params.sort // Currently only "sessionDates available in search config"
    };
    queryParams.filter[searchModifier + textSearchKey] = params.searchText;

    let searchDocumentType = params.decisionsOnly ? 'casesByDecisionText' : 'cases';
    if (!isEmpty(params.mandatees)) {
      queryParams.filter['creators,mandatees'] = params.mandatees;
    }
    if (!isEmpty(params.dateFrom)) {
      queryParams.filter[':gte:sessionDates'] = params.dateFrom;
    }
    if (!isEmpty(params.dateTo)) {
      queryParams.filter[':lte:sessionDates'] = params.dateTo;
    }
    const postProcessDates = this.postProcessDates;
    return this.muSearch.query(searchDocumentType,
                               queryParams,
                               this.get('modelName'),
                               {'session-dates': 'sessionDates'})
      .then(function(res) {
        that.set('isLoading', false);
        res.forEach(postProcessDates);
        return res;
      }).catch(() => {
        that.set('isLoading', false);
        return [];
      });
  },

  actions: {
    refreshModel() {
      this.refresh();
    },
  },
});
