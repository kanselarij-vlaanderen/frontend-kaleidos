import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
	store:inject(),
	isAdding:false,
	isResigning:false,
	isEditing: false, 
	selectedMandatee:null,

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

		resignMandatee(mandateeToEdit) {
			this.set('mandateeToResign', mandateeToEdit);
		}
	}
});
