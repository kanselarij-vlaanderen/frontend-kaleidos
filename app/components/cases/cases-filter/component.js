import Component from '@ember/component';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
  classNames: ['vl-form vl-u-spacer-extended-bottom-l vlc-box'],
  searchText: null,
  disableAdvanced: false,
  ministerName: null,
  dateFrom: null,
  dateTo: null,
  so: false,
  popoverShown: false,

  searchTask: task(function* () {
    yield timeout(600);
    this.filter({
      searchText: this.searchText,
      mandatees: this.ministerName,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
      searchInDecisionsOnly: this.searchInDecisionsOnly
    });
  }).restartable(),

  actions: {
    selectDateFrom(date) {
      this.set('dateFrom', date);
      this.searchTask.perform();
    },
    selectDateTo(date) {
      this.set('dateTo', date);
      this.searchTask.perform();
    },
    openPopover() {
      this.set('popoverShown', true);
    },
    closePopover() {
      this.set('popoverShown', false);
    },
  }
});
