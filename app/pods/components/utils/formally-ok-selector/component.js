import Component from '@ember/component';
import CONFIG from 'fe-redpencil/utils/config';
import EmberObject from '@ember/object';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: ['vl-u-spacer-extended-bottom-s'],
  isLoading: null,
  hideLabel: null,

  options: computed(function () {
    return CONFIG.formallyOkOptions.map((item) => {
      return EmberObject.create(item);
    })
  }),

  selectedFormallyOk: computed('options', 'formallyOk', function () {
    const formallyOk = this.get('formallyOk');
    if (!formallyOk) {
      return this.options.find((option) => option.get('uri') === CONFIG.notYetFormallyOk);
    } else {
      return this.options.find((option) => option.get('uri') === formallyOk);
    }
  }),

  actions: {
    setAction(item) {
      this.set('selectedFormallyOk', item);
      this.setAction(item);
    }
  }
});
