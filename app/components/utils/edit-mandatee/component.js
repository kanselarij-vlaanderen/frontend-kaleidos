import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
	mandateeToEdit: null,

	title: computed('mandateeToEdit', function() {
		return this.get('mandateeToEdit.title');
	}),

	startDate: computed('mandateeToEdit', function() {
		return this.get('mandateeToEdit.start');
	}),

	actions: {
		selectStartDate(val) {
			this.set('startDate', val);
		},
		chooseDomain(domains) {
			this.set('selectedDomains', domains);
		},
		closeModal() {
			this.closeModal();
		},

		saveChanges(mandateeToEdit) {
			mandateeToEdit.set('end', null);
			mandateeToEdit.set('start', this.get('startDate'));
			
			mandateeToEdit.save().then(() => {
				this.closeModal();
			});
		}
	}
});
