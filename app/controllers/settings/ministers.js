import Controller from '@ember/controller';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { task } from 'ember-concurrency';
import { isPresent } from '@ember/utils';
export default Controller.extend(isAuthenticatedMixin, {
	isEditingMandatee: false,
	isAddingMandatee: false,
	isResigningMandatee:false,
	reAssignPriorities: task(function* (model) {
		yield model.map((item) => {
			if (isPresent(item.changedAttributes().priority)) {
				return item.save();
			}
		});
	}).restartable(),

	actions: {
		async reorderItems(model, reOrderedModel, itemDragged) {
			if (this.isEditor || this.isAdmin) {
				const firstPrio = 1;
				for (let i = 0; i < reOrderedModel.get('length'); i++) {
					const reOrderedAgendaitem = reOrderedModel.objectAt(i);
					const agendaitem = model.find((item) => item.id === reOrderedAgendaitem.get('id'));
					const newPrio = (i + firstPrio);
					agendaitem.set('priority', newPrio);
				}
				this.reAssignPriorities.perform(model);
				this.set('model', model.sortBy('priority'));
			}
		},

		toggleProperty(prop, mandateeToEdit) {
			this.set('mandateeToEdit', mandateeToEdit)
			this.toggleProperty(prop);
		},

		toggleIsAdding() {
			this.toggleProperty('isAddingMandatee');
		},

		cancel() {
			this.set('isDeletingMandatee', false);
		},

		async	deleteMandatee() {
			const mandateeToEdit = await this.get('mandateeToEdit');
			this.model.removeObject(mandateeToEdit);
			await mandateeToEdit.destroyRecord();
			this.set('isDeletingMandatee', false);
		},
	}
});
