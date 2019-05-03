
import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
	classNames: ['vl-u-spacer-extended-l'],
	isEditing: false,
	store:inject(), 
	
	actions: {
		async toggleIsEditing() {
			const meetingNotes = await this.get('currentSession.notes');
			if (!meetingNotes) {
				const meetingRecord = this.store.createRecord('meeting-record',
					{
						created: new Date(),
						modified: new Date(),
						meeting: await this.get('currentSession')
					});
				await meetingRecord.save();
			}
			this.toggleProperty('isEditing')
		}
	}
});
