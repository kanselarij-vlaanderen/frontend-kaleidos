import Controller from '@ember/controller';
import { inject } from '@ember/service';

export default Controller.extend({
  store: inject(),
  isEditingMandatees: false,
  mandatees:null,

  actions: {	
    refresh() {
    this.send('refresh');
  },
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
    }
  }
});
