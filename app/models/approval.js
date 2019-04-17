import DS from 'ember-data';

let { Model, attr, belongsTo } = DS;

export default Model.extend({
	created: attr('date'),
	modified: attr('date'),
	approved: attr('boolean'),
	mandatee: belongsTo('mandatee', {inverse:null}),
	subcase: belongsTo('subcase'),
	agendaitem: belongsTo('agendaitem')
});
