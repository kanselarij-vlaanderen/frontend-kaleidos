import Component from '@ember/component';
import {inject} from "@ember/service";
import DataTableRouteMixin from 'ember-data-table/mixins/route';
import {isEmpty} from '@ember/utils';
import DS from 'ember-data';
import { get, set, observer } from "@ember/object";
import moment from "moment";
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { debounce } from '@ember/runloop';
import _ from "lodash";

export default Component.extend(DataTableRouteMixin, AuthenticatedRouteMixin, {
  store: inject(),
  muSearch: inject(),
  size: 5,
  sort: "title",
  action: "",
  onSelect: null,
  textSearchFields: ['title', 'shortTitle', 'data', 'subcaseTitle', 'subcaseSubTitle'],
  isLoading: false,
  isArchived: false,
  searchText: null,
  mandatees: [],
  dateFrom: null,
  dateTo: null,
  decisionsOnly: false,
  page: 0,
  results: null,

  didReceiveAttrs() {
    this.send('performSearch');
  },

  searchChanged: observer('searchText', function () {
    debounce(this, this.debouncedSearch, 500);
  }),

  debouncedSearch: function() {
    this.send('performSearch', get(this, 'searchText'));
  },

  postProcessDates: function (_case) {
    const sessionDates = _case.get('sessionDates');
    if (sessionDates) {
      if (Array.isArray(sessionDates)) {
        const moments = sessionDates.map(sessionDate => moment(sessionDate));
        _case.set('sessionDates', moments[moments.length - 1])
      } else {
        _case.set('sessionDates', moment(sessionDates));
      }
    }
  },

  actions: {
    async performSearch(searchTerm) {
      set(this, 'isLoading', true);

      const results = await DS.PromiseArray.create({
        promise: (() => {
          // let params = {};
          const searchModifier = ':sqs:';

          const textSearchKey = this.textSearchFields.join(',');
          let queryParams = {
            filter: {
              // 'is-archived': params.isArchived // Cannot post-filter on mu-cl-resources. field MUST be included in search-object keys
            },
            page: {
              size: this.size,
              number: this.page
            },
            sort: this.sort // Currently only "sessionDates available in search config"
          };
          if(!searchTerm) {
            _.merge(queryParams, this.mergeQueryOptions(queryParams));
            this.set('isLoading', false);
            return this.get('store').query("case",queryParams);
          }
          queryParams.filter[searchModifier + textSearchKey] = searchTerm;

          let searchDocumentType = this.decisionsOnly ? 'casesByDecisionText' : 'cases';
          if (!isEmpty(this.mandatees)) {
            queryParams.filter['creators,mandatees'] = this.mandatees;
          }
          if (!isEmpty(this.dateFrom)) {
            queryParams.filter[':gte:sessionDates'] = this.dateFrom;
          }
          if (!isEmpty(this.dateTo)) {
            queryParams.filter[':lte:sessionDates'] = this.dateTo;
          }
          const postProcessDates = this.postProcessDates;
          return this.muSearch.query(searchDocumentType,
            queryParams,
            "case",
            {'session-dates': 'sessionDates'})
            .then((res) => {
              this.set('isLoading', false);
              res.forEach(postProcessDates);
              return res;
            }).catch((error) => {
              console.log(error);
              this.set('isLoading', false);
              return [];
            })
        })()
      });

      set(this, 'results', results);
    },

    async selectCase(caseItem, event) {
      // We never set loading to false, because the component closes after this action
      set(this, 'isLoading', true);
      if (event) {
        event.stopPropagation();
      }
      this.onSelect(caseItem);
    },

    selectSize(size) {
      this.set('size', size);
    }
  }


});
