import Component from '@ember/component';

export default Component.extend({
  value: false,
  disabled: false,
  toggle: null, // function called when value changes

  actions: {
    toggle() {
      this.toggle(!this.get('value'));
    },
  },
});
