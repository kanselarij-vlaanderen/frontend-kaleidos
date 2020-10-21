import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
  classNames: ['data-table-pagination'],

  sizeOptions: Object.freeze([5, 10, 20, 50, 100, 200]),
  size: 20,

  currentPage: computed('page', {
    get() {
      return this.get('page') ? parseInt(this.get('page'), 10) + 1 : 1;
    },
    // eslint-disable-next-line no-unused-vars
    set(key, value) {
      this.set('page', value - 1);
      return value;
    },
  }),
  firstPage: computed('links', function() {
    return this.get('links.first.number') || 1;
  }),
  lastPage: computed('links', function() {
    const max = this.get('links.last.number') || -1;
    return max ? max + 1 : max;
  }),
  isFirstPage: computed('firstPage', 'currentPage', function() {
    return this.get('firstPage') === this.get('currentPage');
  }),
  isLastPage: computed('lastPage', 'currentPage', function() {
    const lastPage = this.get('lastPage');
    const currrentPage = this.get('currentPage');
    return lastPage === currrentPage;
  }),
  hasMultiplePages: computed('lastPage', function() {
    return this.get('lastPage') > 0;
  }),
  startItem: computed('size', 'currentPage', function() {
    const startitem = this.get('size') * (this.get('currentPage') - 1);
    return startitem + 1;
  }),
  endItem: computed('startItem', 'nbOfItems', function() {
    return this.get('startItem') + this.get('nbOfItems') - 1;
  }),
  pageOptions: computed('firstPage', 'lastPage', function() {
    const nbOfPages = this.get('lastPage') - this.get('firstPage') + 1;
    // eslint-disable-next-line no-unused-vars
    return Array.from(new Array(nbOfPages), (val, index) => this.get('firstPage') + index);
  }),
  actions: {
    changePage(link) {
      this.set('page', link.number || 0);
    },
    selectSize(size) {
      this.set('size', size);
    },
  },
});
