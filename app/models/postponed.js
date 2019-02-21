import DS from 'ember-data';

let { Model, attr, hasMany, belongsTo } = DS;

export default Model.extend({
	postponed: attr('boolean'),
	agendaitems: hasMany('agendaitem'),
	meeting: belongsTo('meeting')
});
