import DS from 'ember-data';
import { computed } from '@ember/object';

let { Model, attr, belongsTo, hasMany } = DS;

export default Model.extend({
	name: attr("string"),
	dateSent: attr("date"),
	final:attr("boolean"),
	locked:attr("boolean"),
	session: belongsTo('session'),
	agendaitems: hasMany('agendaitem'),
  announcements: hasMany('announcement'),

	agendaName: computed('name', function() {
		if(this.name.length <= 2) {
			return 'Agenda ' + this.name;
		} else {
			return this.name;
		}
	})
});
