import Component from '@ember/component';

export default Component.extend({
  classNames: ['vl-toggle__wrapper'],
  value: null,

  actions: {
    valueChanged() {
      this.toggleProperty('value');
      const action = this.get('valueChanged');
      if (action) {
        return action(this.value);
      }
    },
  },
});
