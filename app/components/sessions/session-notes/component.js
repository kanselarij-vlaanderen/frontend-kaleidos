import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
	classNames: ["vl-u-spacer-extended-bottom-l"],
	store: inject(),
	session: inject(),

	actions: {
		selectStartDate(val) {
			this.set('startDate', val);
		},

		peopleSelected(mandatees) {
			this.set('selectedMandatees', mandatees);
		},

		cancel(notes) {
			const notesToEdit = this.store.peekRecord('meeting-record', notes.get('id'));
			notesToEdit.rollbackAttributes().then(() => {
				this.toggleProperty('isEditing');
			});
		},

		saveChanges(notes) {
			const notesToSave = this.store.peekRecord('meeting-record', notes.get('id'));
			const selectedMandatees = this.get('selectedMandatees');
			if (selectedMandatees) {
				notesToSave.set('attendees', selectedMandatees);
			}
			notesToSave.save().then(() => {
				this.toggleProperty('isEditing');
			});
		}
	}
});
