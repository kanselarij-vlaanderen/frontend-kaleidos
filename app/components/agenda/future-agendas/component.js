import Component from '@ember/component';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Component.extend(isAuthenticatedMixin, {
	classNames:["vl-u-spacer--large"],
	selectedMeeting:null,

	actions: {
		selectAgenda(meeting) {
			this.selectAgenda(meeting);
		}
	}
});
