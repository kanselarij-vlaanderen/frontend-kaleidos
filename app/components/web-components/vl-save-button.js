import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

export default Component.extend({
  intl: inject(),
  tagName: 'button',
  type: 'button',
  attributeBindings: ['isLoading:disabled', 'testTag:data-test-save-button'],
  classNameBindings: ['isLoading::auk-button', 'isLoading::auk-button--primary', 'isLoading:auk-button-loading'],
  testTag: true, // Hack to show a value-less attribute for testing

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
