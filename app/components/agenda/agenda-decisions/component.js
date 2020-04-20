import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
  isEditing: false,
  session: service('current-session'),

  allowEditing: computed('definite', function () {
    return this.definite === 'false';
  }),

  actions: {
    close() {
      this.closeModal();
    },
    toggleIsEditing(decision) {
      decision.toggleProperty('isEditing');
    }
  }
});
