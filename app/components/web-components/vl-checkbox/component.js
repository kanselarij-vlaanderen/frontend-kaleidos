import Component from '@ember/component';

export default Component.extend({
  actions: {
    toggle() {
      this.toggle(!this.get('value'));
    }
  }
});
