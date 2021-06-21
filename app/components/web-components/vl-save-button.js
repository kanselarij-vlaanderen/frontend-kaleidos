import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

export default Component.extend({
  intl: inject(),
  tagName: 'button',
  type: 'button',
  attributeBindings: ['isLoading:disabled'],
  classNameBindings: ['isLoading::auk-button', 'isLoading::auk-button--primary', 'isLoading:auk-button-loading'],

  focus: computed('isLoading', function() {
    return !this.isLoading;
  }),

  click() {
    if (this.type === 'button') {
      if (!this.isLoading) {
        this.saveAction();
      }
    }
  },
});
