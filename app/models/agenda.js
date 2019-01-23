import DS from 'ember-data';

let { Model, attr, belongsTo, hasMany } = DS;

export default Model.extend({
	name: attr("string"),
	dateSent: attr("date"),
	final:attr("boolean"),
	locked:attr("boolean"),
	session: belongsTo('session'),
	agendaitems: hasMany('agendaitem')
});
