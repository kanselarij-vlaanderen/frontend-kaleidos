import Component from '@ember/component';
import { inject } from '@ember/service';
import EmberObject from '@ember/object';
import moment from 'moment';
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
		  const selectedPerson = this.get('selectedPerson');
		  if(!selectedPerson){
        this.globalError.showToast.perform(
          EmberObject.create({
            title: 'Opgelet!',
            message: 'Het mandaat wordt beëindigd, maar er is geen nieuwe mandataris gekozen.',
            type: 'warning-undo'
          })
        );
		  }
			this.set('isLoading', true);
			const oldMandatee = this.get('mandateeToEdit');
			const domains = await oldMandatee.get('governmentDomains');
			const holds = await oldMandatee.get('holds');

			oldMandatee.set('end', this.get('selectedEndDate') || moment().toDate());
			oldMandatee.save().then(() => {
			  if(!selectedPerson){
          return;
			  }
				const newMandatee = this.store.createRecord('mandatee', {
					title: oldMandatee.get('title'),
					start: this.get('selectedStartDate') || moment().toDate(),
					end: moment().add(5, 'years').toDate(),
					person: selectedPerson,
					holds: holds,
					governmentDomains: domains,
					priority: oldMandatee.get('priority')
				});
				return newMandatee.save().then(() => {
					this.get('subcasesService').setNewMandateeToRelatedOpenSubcases(oldMandatee.get('id'), newMandatee.get('id'));
				});
			}).then(() => {
			  this.mandateesUpdated();
        this.set('isLoading', false);
        this.closeModal();
			});
		}
	}
});
