import Component from '@ember/component';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { computed } from '@ember/object';

export default Component.extend(isAuthenticatedMixin, {
	classNames:["vl-u-spacer--large"],
	selectedMeeting:null,

	items: computed('meetings', 'type', 'nearestMeeting', function() {
		if(this.type === "future") {
			const nearestMeeting =  this.get('nearestMeeting.firstObject');
			if(!nearestMeeting) {
				return this.meetings;
			}
			return this.meetings.filter((item) => item.get('id') != nearestMeeting.get('id'));
		}	else {
			return this.meetings;
		}
	}),

	actions: {
		selectAgenda(meeting) {
			this.selectAgenda(meeting);
		}
	}
});
