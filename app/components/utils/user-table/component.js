import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import LightTableMixin from 'fe-redpencil/mixins/light-table/light-table-mixin';
import { observer } from '@ember/object';

export default Component.extend(LightTableMixin, {
  classNames: ['container-flex'],
  modelName: 'user',
  isScrolling: false,
  shouldRefreshTableModel: null,
  sort: 'last-name',

  intl: inject(),

  modelObserver: observer('shouldRefreshTableModel', function() {
    if(this.shouldRefreshTableModel) {
      this.initialiseTableBasedOnModel();
      this.set('shouldRefreshTableModel', false);
    }
  }),

  init() {
    this._super(...arguments);
    observer('filter', function(){
      this.get("fetchRecords").perform();
    });
  },

  loadingText: computed('intl', function() {
    return this.intl.t('users-loading-text')
  }),
});
