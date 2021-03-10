import Component from '@ember/component';
import {
  computed, get
} from '@ember/object';
import { alias } from '@ember/object/computed';

export default Component.extend({
  pageOffset: 0,
  total: null,
  page: null,
  size: null,
  nbOfItems: null,

  currentPage: alias('page'),
  firstPage: alias('pageOffset'),

  disabledNext: computed('isLastPage', function() {
    return this.get('isLastPage');
  }),

  disabledPrev: computed('isFirstPage', function() {
    return this.get('isFirstPage');
  }),

  totalNbOfItems: computed('total', function() {
    if (!get(this, 'total')) {
      return 0;
    }

    return get(this, 'total');
  }),

  lastPage: computed('size', 'total', function() {
    return Math.ceil(get(this, 'total') / get(this, 'size')) - 1;
  }),

  isFirstPage: computed('firstPage', 'currentPage', function() {
    return get(this, 'firstPage') === get(this, 'currentPage');
  }),

  isLastPage: computed('lastPage', 'currentPage', function() {
    return get(this, 'lastPage') === get(this, 'currentPage');
  }),

  hasMultiplePages: computed('lastPage', function() {
    return get(this, 'lastPage') > 0;
  }),

  startItem: computed('size', 'currentPage', 'nbOfItems', function() {
    if (get(this, 'nbOfItems') === 0) {
      return 0;
    }
    return (get(this, 'size') * get(this, 'currentPage')) + 1;
  }),

  endItem: computed('startItem', 'nbOfItems', function() {
    if (get(this, 'nbOfItems') === 0) {
      return 0;
    }
    return (get(this, 'startItem') + get(this, 'nbOfItems')) - 1;
  }),

  actions: {
    nextPage() {
      this.nextAction();
    },

    prevPage() {
      this.previousAction();
    },
  },
});
