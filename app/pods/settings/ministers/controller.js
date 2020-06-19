import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { isPresent } from '@ember/utils';

export default Controller.extend({
  currentSession: service(),

  isEditingMandatee: false,
  isAddingMandatee: false,
  isResigningMandatee: false,
  reAssignPriorities: task(function* (model) {
    yield model.map((item) => {
      if (isPresent(item.changedAttributes().priority)) {
        return item.save();
      }
      return item;
    });
  }).restartable(),

  actions: {
    async reorderItems(model, reOrderedModel) {
      if (this.currentSession.isEditor) {
        const firstPrio = 1;
        for (let i = 0; i < reOrderedModel.get('length'); i++) {
          const reOrderedMandatee = reOrderedModel.objectAt(i);
          const mandatee = model.find((item) => item.id === reOrderedMandatee.get('id'));
          const newPrio = (i + firstPrio);
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
});
