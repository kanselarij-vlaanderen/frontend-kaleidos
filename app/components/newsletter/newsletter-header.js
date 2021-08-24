// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  isAddingSingleNewsLetter: false,

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    toggleIsAddingSingleNewsLetter() {
      this.toggleProperty('isAddingSingleNewsLetter');
    },
    close() {
      this.toggleProperty('isAddingSingleNewsLetter');
    },
  },
});
