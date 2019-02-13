import DS from 'ember-data';

let { Model, attr, hasMany } = DS;

export default Model.extend({
	newDate: attr('date'),
	postponed: attr('boolean'),
	agendaitems: hasMany('agendaitem')
});
