/* eslint-disable ember/no-arrow-function-computed-properties */
import Component from '@ember/component';
import CONFIG from 'fe-redpencil/utils/config';
import EmberObject, { computed } from '@ember/object';

export default Component.extend({
  classNames: ['vl-u-spacer-extended-bottom-s'],
  isLoading: null,
  hideLabel: null,

  options: computed(() => CONFIG.kinds.map((item) => EmberObject.create(item))),

  selectedkind: computed('options', 'kind', function() {
    return this.options.find((kind) => this.kind && kind.uri === this.kind.uri) || this.options.get('firstObject');
  }),

  actions: {
    setAction(item) {
      this.set('selectedkind', item);
      this.setAction(item.get('uri'));
    },
  },
});
