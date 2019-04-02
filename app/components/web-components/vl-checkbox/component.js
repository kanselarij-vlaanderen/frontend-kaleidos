import Component from '@ember/component';

export default Component.extend({
  actions : {
    toggle (event) {
      this.toggle(!this.get('value'));
    }
  }
});
