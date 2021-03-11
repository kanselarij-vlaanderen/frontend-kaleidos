import Component from '@ember/component';

export default Component.extend({
  classNames: ['vl-alert', 'vl-alert--warning'],

  actions: {
    clearAction() {
      this.clearAction();
    },
  },
});
