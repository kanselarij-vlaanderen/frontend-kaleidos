import DS from 'ember-data';

let { Model, attr, hasMany } = DS;

export default Model.extend({
	plannedStart: attr("date"),
	created: attr('date'),
	startedOn: attr("date"),
	endedOn: attr('date'),
	location: attr('string'),
	number: attr('number'),
	agendas: hasMany('agenda'),
	subcases: hasMany('subcase'),
	postponedItems: hasMany('postponed')
});
