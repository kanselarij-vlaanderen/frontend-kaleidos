import Component from '@ember/component';
import { inject } from '@ember/service';
import EmberObject from '@ember/object';

export default Component.extend({
	store: inject(),
	subcasesService: inject(),
  globalError: inject(),
  isResigning: false,
	isEditing: false,
	selectedStartDate: null,
	selectedEndDate: null,
	mandateesUpdated: null,

	actions: {
		closeModal() {
			this.closeModal();
		},

		selectMandatee(mandatee) {
			this.set('mandateeToEdit', mandatee);
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
		  if(!this.get('selectedPerson')){
        this.globalError.showToast.perform(
          EmberObject.create({
            title: 'Opgelet!',
            message: 'Geen nieuwe mandataris gekozen.',
            type: 'error'
          })
        );
        return
		  }

			this.set('isLoading', true);
			const oldMandatee = this.get('mandateeToEdit');
			const domains = await oldMandatee.get('governmentDomains');
			const holds = await oldMandatee.get('holds');

			oldMandatee.set('end', this.get('selectedEndDate') || moment().toDate());
			oldMandatee.save().then(() => {
				const newMandatee = this.store.createRecord('mandatee', {
					title: oldMandatee.get('title'),
					start: this.get('selectedStartDate') || moment().toDate(),
					end: moment().add(5, 'years').toDate(),
					person: this.get('selectedPerson'),
					holds: holds,
					governmentDomains: domains,
					priority: oldMandatee.get('priority')
				});
				return newMandatee.save().then(() => {
					this.get('subcasesService').setNewMandateeToRelatedOpenSubcases(oldMandatee.get('id'), newMandatee.get('id'));
					this.set('isLoading', false);
					this.closeModal();
				});
			}).then(() => {
			  this.mandateesUpdated();
			});
		}
	}
});
