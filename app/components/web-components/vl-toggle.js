// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  classNames: ['vl-toggle__wrapper'],
  value: null,

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
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
