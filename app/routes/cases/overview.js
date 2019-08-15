import Route from '@ember/routing/route';
import DataTableRouteMixin from 'ember-data-table/mixins/route';
import $ from 'jquery';
import { isEmpty } from '@ember/utils';

export default Route.extend(DataTableRouteMixin, {
  modelName: 'case',

  queryParams: {
    isArchived: {
      refreshModel: true,
    },
    searchText: {
      refreshModel: true,
    },
    mandatees: {
      refreshModel: true,
    },
    dateFrom: {
      refreshModel: true,
    },
    dateTo: {
      refreshModel: true,
    },
    decisionsOnly: {
      refreshModel: true,
    },
  },

  textSearchFields: ['title', 'data', 'subcaseTitle', 'subcaseSubTitle'],

  mergeQueryOptions(params) {
    let filter = {};
    filter['is-archived'] = params.isArchived;
    return {
      filter: filter,
    };
  },

  wantsFilteredResults(params) {
    return (
      !isEmpty(params.searchText) ||
      !isEmpty(params.dateFrom) ||
      !isEmpty(params.dateTo) ||
      !isEmpty(params.mandatees) ||
      !isEmpty(params.decisionsOnly)
    );
  },

  async model(params) {
    if (!this.wantsFilteredResults(params)) {
      return this._super(...arguments);
    }
    let filterString = [];
    let type = 'cases';
    if (!isEmpty(params.decisionsOnly)) {
      type = 'casesByDecisionText';
    }
    if (!isEmpty(params.searchText)) {
      filterString.push(`filter[${this.textSearchFields.join(',')}]=${params.searchText || ''}`);
    }
    if (!isEmpty(params.mandatees)) {
      filterString.push(`filter[creators,mandatees]=${params.mandatees}`);
    }
    if (!isEmpty(params.dateFrom)) {
      filterString.push(`filter[:gte:sessionDates]=${params.dateFrom}`);
    }
    if (!isEmpty(params.dateTo)) {
      filterString.push(`filter[:lte:sessionDates]=${params.dateTo}`);
    }
    let searchResults = await $.ajax({
      method: 'GET',
      url: `/${type}/search?${filterString.join('&')}`,
    });

    if (!searchResults.data || searchResults.data.length < 1) {
      return [];
    }

    return this.store.query(this.get('modelName'), {
      filter: {
        id: searchResults.data.map((item) => item.id).join(','),
      },
    });
  },

  actions: {
    refreshModel() {
      this.refresh();
    },
  },
});
