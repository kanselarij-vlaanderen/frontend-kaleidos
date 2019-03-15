import DS from 'ember-data';
import { computed } from '@ember/object';
import moment from 'moment';

const { Model, attr, hasMany, belongsTo } = DS;

export default Model.extend({
	created: attr('date'),
	modified: attr('date'),
	announcements: attr('string'),
	others: attr('string'),
	description: attr('string'),
	attendees: hasMany('mandatee'),
	agendaitem: belongsTo('agendaitem'),
	meeting: belongsTo('meeting'),

	nextMeeting: computed('meeting', async function() {
		const currentMeeting = this.get('meeting');
		const meetings = await this.store.query('meeting', {
			filter: {':gt:planned-start': moment(currentMeeting.get('plannedStart')).format()}
		});
		
		return meetings.get('firstObject');
	})
});
