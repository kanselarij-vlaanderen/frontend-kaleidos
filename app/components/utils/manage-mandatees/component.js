import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
	store: inject(),
	subcasesService: inject(),
	isAdding: false,
	isResigning: false,
	isEditing: false,
	selectedStartDate: null,
	selectedEndDate: null,

	actions: {
		closeModal() {
			this.closeModal();
		},

		selectMandatee(mandatee) {
			this.set('selectedMandatee', mandatee);
		},

		toggleIsAdding() {
			this.toggleProperty('isAdding');
		},

		toggleIsEditing() {
			this.toggleProperty('isEditing');
		},

		toggleIsResigning() {
			this.toggleProperty('isResigning');
		},

		selectEndDate(date) {
			this.set('selectedEndDate', date);
		},

		selectNewStartDate(date) {
			this.set('selectedStartDate', date)
		},

		personSelected(person) {
			this.set('selectedPerson', person);
		},

		resignMandatee(mandateeToEdit) {
			this.set('mandateeToResign', mandateeToEdit);
			this.toggleProperty('isResigning');
		},

		async saveResignation() {
			this.set('isLoading', true);
			let oldMandatee = this.get('selectedMandatee');
			let domains = await oldMandatee.get('governmentDomains');
			let holds = await oldMandatee.get('holds');

			oldMandatee.set('end', this.get('selectedEndDate'));
			oldMandatee.save().then(() => {
				const newMandatee = this.store.createRecord('mandatee', {
					title: oldMandatee.get('title'),
					start: this.get('selectedStartDate'),
					end: null,
					person: this.get('selectedPerson'),
					holds: holds,
					governmentDomains: domains,
					priority: oldMandatee.get('priority')
				});
				newMandatee.save().then(() => {
					this.get('subcasesService').setNewMandateeToRelatedOpenSubcases(oldMandatee.get('id'), newMandatee.get('id'));
					this.set('isLoading', false);
					this.closeModal();
				});
			});
		}
	}
});
