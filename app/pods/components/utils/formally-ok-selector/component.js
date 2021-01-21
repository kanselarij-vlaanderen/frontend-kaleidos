/* eslint-disable ember/no-arrow-function-computed-properties */
import Component from '@ember/component';
import CONFIG from 'fe-redpencil/utils/config';
import EmberObject, { computed } from '@ember/object';

export default Component.extend({
  classNames: ['auk-u-mb-2'],
  isLoading: null,
  hideLabel: null,

  options: computed(() => CONFIG.formallyOkOptions.map((formallyOkOption) => EmberObject.create(formallyOkOption))),

  selectedFormallyOk: computed('options', 'formallyOk', function() {
    const formallyOk = this.get('formallyOk');
    if (!formallyOk) {
      return this.options.find((option) => option.get('uri') === CONFIG.notYetFormallyOk);
    }
    return this.options.find((option) => option.get('uri') === formallyOk);
  }),

  actions: {
    setAction(formallyOkStatus) {
      this.set('selectedFormallyOk', formallyOkStatus);
      this.setAction(formallyOkStatus);
    },
  },
});
