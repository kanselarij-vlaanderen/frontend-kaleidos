import DS from 'ember-data';
import { computed } from '@ember/object';

let { Model, attr, belongsTo, hasMany } = DS;

export default Model.extend({
	name: attr("string"),
	issued: attr("date"),
	createdFor: belongsTo('meeting'),
	agendaitems: hasMany('agendaitem', {inverse: null, serialize: false}),
	created: attr('date'),
	isAccepted: attr('boolean'),
	// announcements: hasMany('announcement'),

	agendaName: computed('name', function() {
		if(this.get('name.length') > 2) {
			return this.name;
		} else {
			return 'Agenda ' + this.name;
		}
	})
});
