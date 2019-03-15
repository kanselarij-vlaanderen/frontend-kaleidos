import Component from '@ember/component';

export default Component.extend({
	classNames:["vl-u-spacer--large"],
	isAddingNotes:false,
	selectedMeeting:null,

	actions: {
		selectAgenda(meeting) {
			this.selectAgenda(meeting);
		},

		addNotesToMeeting(meeting) {
			this.set('selectedMeeting', meeting);
			this.toggleProperty('isAddingNotes');
		},

		close() {
			this.set('selectedMeeting', null);
			this.toggleProperty('isAddingNotes');
		}
	}
});
