import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import LightTableMixin from 'fe-redpencil/mixins/light-table/light-table-mixin';

export default Component.extend(LightTableMixin, {
  classNames: ['container-flex'],
  modelName: 'user',
  isScrolling: false,

  intl: inject(),
  loadingText: computed('intl', function() {
    return this.intl.t('users-loading-text')
  }),
});
