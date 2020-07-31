import Component from '@ember/component';

export default Component.extend({
  classNames: ['vl-checkbox-container'],
  actions: {
    toggle() {
      this.toggle(!this.get('value'));
    },
  },
});
