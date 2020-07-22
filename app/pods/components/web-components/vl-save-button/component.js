import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

export default Component.extend({
  intl: inject(),
  tagName: 'button',
  classNames: ['vl-button'],
  type: 'button',
  attributeBindings: ['isLoading:disabled', 'disabled:disabled', 'testTag:data-test-save-button'],
  classNameBindings: ['isLoading:vl-button--loading', 'disabled:vl-button--disabled'],
  testTag: true, // Hack to show a value-less attribute for testing

  loadingText: computed('intl', function() {
    return this.intl.t('please-be-patient');
  }),

  focus: computed('isLoading', function() {
    return !this.isLoading;
  }),

  textToDisplay: computed('text', 'isLoading', 'loadingText', function() {
    if (this.isLoading) {
      return this.loadingText;
    }
    return this.text;
  }),

  click() {
    if (this.type === 'button') {
      if (!this.isLoading) {
        this.saveAction();
      }
    }
  },
});
