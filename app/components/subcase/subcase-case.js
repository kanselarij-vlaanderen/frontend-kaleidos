import Component from '@ember/component';
import { inject } from '@ember/service';
import {
  computed, set
} from '@ember/object';

export default Component.extend({
  authentication: inject('currentSession'),
  subcase: null,
  isEditing: false,

  subcases: computed('subcase', async function() {
    return this.get('subcase.subcasesFromCase');
  }),

  actions: {
    cancelEditing() {
      set(this, 'isEditing', false);
    },

    toggleConfidential(value) {
      this.subcase.set('confidential', value);
    },

    toggleIsEditing() {
      this.toggleProperty('isEditing');
    },

    chooseConfidentiality(confidentiality) {
      this.subcase.set('confidentiality', confidentiality);
    },
  },
});
