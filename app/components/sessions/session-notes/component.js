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

		async cancel(notes) {
			const notesToEdit = await this.store.findRecord('meeting-record', (await notes.get('id')));
			if (!notesToEdit) {
				this.toggleProperty('isEditing');
			}
			notesToEdit.rollbackAttributes();
			this.toggleProperty('isEditing');
		},

		async saveChanges(notes) {
			const notesToSave = await this.store.findRecord('meeting-record', notes.get('id'));
			const selectedMandatees = this.get('selectedMandatees');
			if (selectedMandatees) {
				notesToSave.set('attendees', selectedMandatees);
			}
			notesToSave.save().then(() => {
				notesToSave.hasMany('attendees').reload();
				this.toggleProperty('isEditing');
			});
		}
	}
});
