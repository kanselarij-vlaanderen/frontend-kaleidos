import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import LightTableMixin from 'fe-redpencil/mixins/light-table/light-table-mixin';
import { observer } from '@ember/object';
export default Component.extend(LightTableMixin, {
  classNames: ['container-flex'],
  modelName: 'user',
  isScrolling: false,
  sortBy: 'last-name',

  intl: inject(),

  modelObserver: observer('model.length', function() {
    this.init();
  }),
  
  loadingText: computed('intl', function() {
    return this.intl.t('users-loading-text')
  }),
});
