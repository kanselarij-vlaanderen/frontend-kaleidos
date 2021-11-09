import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
// import { task } from 'ember-concurrency';
// import { isPresent } from '@ember/utils';

// TODO: octane-refactor
/* eslint-disable ember/no-get */
// eslint-disable-next-line ember/no-classic-classes
export default Controller.extend({
  currentSession: service(),

  /*
  This route is currently a read-only-feature.
  The original minister-management feature wasn't designed with the full
  complexity of the mandatees/government-body model in mind. Since the edit-features
  as-is would break data, they are currently disabled awaiting re-design.
  For more info on the mandatee-model, see https://themis-test.vlaanderen.be/docs/catalogs
  */
  /*
  isEditingMandatee: false,
  isAddingMandatee: false,
  isResigningMandatee: false,
  reAssignPriorities: task(function *(model) {
    yield model.map((item) => {
      if (isPresent(item.changedAttributes().priority)) {
        return item.save();
      }
      return item;
    });
  }).restartable(),

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    async reorderItems(model, reOrderedModel) {
      if (this.currentSession.isEditor) {
        const firstPrio = 1;
        for (let index = 0; index < reOrderedModel.get('length'); index++) {
          const reOrderedMandatee = reOrderedModel.objectAt(index);
          const mandatee = model.find((mandatee) => mandatee.id === reOrderedMandatee.get('id'));
          const newPrio = (index + firstPrio);
          mandatee.set('priority', newPrio);
        }
        this.reAssignPriorities.perform(model);
        this.set('model', model.sortBy('priority'));
      }
    },

    toggleProperty(prop, mandateeToEdit) {
      this.set('mandateeToEdit', mandateeToEdit);
      this.toggleProperty(prop);
    },

    toggleIsAdding() {
      this.toggleProperty('isAddingMandatee');
    },

    cancel() {
      this.set('isDeletingMandatee', false);
    },

    async deleteMandatee() {
      const mandateeToEdit = await this.get('mandateeToEdit');
      this.model.removeObject(mandateeToEdit);
      await mandateeToEdit.destroyRecord();
      this.set('isDeletingMandatee', false);
    },

    mandateesUpdated() {
      this.send('refreshRoute');
    },
  },
  */
});
