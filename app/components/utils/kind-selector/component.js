import Component from '@ember/component';
import CONFIG from 'fe-redpencil/utils/config';
import EmberObject from '@ember/object';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: ['vl-u-spacer-extended-bottom-s'],
  isLoading: null,
  hideLabel: null,

  options: computed(function() {
    return CONFIG.kinds.map(item => {
      return EmberObject.create(item);
    });
  }),

  selectedkind: computed('options', 'kind', function() {
    return this.options.get('firstObject');
  }),

  actions: {
    setAction(item) {
      this.set('selectedkind', item);
      this.setAction(item.get('uri'));
    }
  }
});
