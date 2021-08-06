import Controller from '@ember/controller';
import { inject } from '@ember/service';

// TODO: octane-refactor
/* eslint-disable ember/no-get */
// eslint-disable-next-line ember/no-classic-classes
export default Controller.extend({
  store: inject(),
  isEditingMandatees: false,
  mandatees: null,

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    async editMandatee(subcase) {
      const mandatees = await subcase.get('mandatees');
      this.set('mandatees', mandatees);
      this.toggleProperty('isEditingMandatees');
    },

    selectMandatees(mandatees) {
      this.set('mandatees', mandatees);
    },

    updateMandatees(subcase) {
      subcase.set('mandatees', []);
      subcase.set('mandatees', this.get('mandatees'));
      subcase.save().then(() => {
        this.toggleProperty('isEditingMandatees');
      });
    },

    refreshRoute() {
      this.send('refresh');
    },
  },
});
