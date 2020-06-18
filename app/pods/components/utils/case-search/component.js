import Component from '@ember/component';
import { get, set, observer } from '@ember/object';
import { isEmpty } from '@ember/utils';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { debounce } from '@ember/runloop';
import { A } from '@ember/array';
import search from '../../../utils/mu-search';

export default Component.extend(AuthenticatedRouteMixin, {
  size: 5,
  action: '',
  onSelect: null,
  textSearchFields: A(['title', 'shortTitle', 'subcaseTitle', 'subcaseSubTitle']),
  isLoading: false,
  searchText: null,
  page: 0,
  results: null,

  didReceiveAttrs() {
    this.send('performSearch');
  },

  searchChanged: observer('searchText', function () {
    debounce(this, this.debouncedSearch, 500);
  }),

  debouncedSearch: function () {
    this.send('performSearch', get(this, 'searchText'));
  },

  actions: {
    async performSearch(searchTerm) {
      set(this, 'isLoading', true);
      // let params = {};
      const searchModifier = ':sqs:';

      const textSearchKey = this.textSearchFields.join(',');

      const filter = {};
      if (!isEmpty(searchTerm)) {
        filter[searchModifier + textSearchKey] = searchTerm;
      }

      if (Object.keys(filter).length == 0) {
        filter[':sqs:title'] = '*'; // search without filter
      }

      const results = await search('cases', this.page, this.size, null, filter, function (item) {
        const entry = item.attributes;
        entry.id = item.id;
        return entry;
      });
      set(this, 'results', results);
      set(this, 'isLoading', false);
    },

    prevPage() {
      if (get(this, 'page') > 0) {
        set(this, 'page', get(this, 'page') - 1);
        this.send('performSearch', get(this, 'searchText'));
      }
    },

    nextPage() {
      set(this, 'page', get(this, 'page') + 1);
      this.send('performSearch', get(this, 'searchText'));
    },

    async selectCase(caseItem, event) {
      // We never set loading to false, because the component closes after this action
      set(this, 'isLoading', true);
      if (event) {
        event.stopPropagation();
      }
      this.onSelect(caseItem);
    },
  }


});
