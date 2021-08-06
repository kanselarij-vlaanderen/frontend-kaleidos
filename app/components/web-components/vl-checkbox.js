// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  value: false,
  disabled: false,
  toggle: null, // function called when value changes

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    toggle() {
      this.toggle(!this.get('value'));
    },
  },
});
