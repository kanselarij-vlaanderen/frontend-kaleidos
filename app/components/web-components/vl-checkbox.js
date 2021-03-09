import Component from '@ember/component';

export default Component.extend({
  classNames: ['vl-checkbox-container'],

  value: false,
  disabled: false,
  single: false,
  toggle: null, // function called when value changes

  actions: {
    toggle() {
      this.toggle(!this.get('value'));
    },
  },
});
