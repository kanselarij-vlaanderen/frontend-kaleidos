import Component from '@ember/component';

export default Component.extend({
	classNames:["vl-u-spacer--large"],
	
	actions: {
		selectAgenda(meeting) {
			this.selectAgenda(meeting);
		}
	}
});
