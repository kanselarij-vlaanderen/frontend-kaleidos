import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;

export default Model.extend({
	label: attr('string'),
  scopeNote: attr('string'),
  subcase: belongsTo('subcase', {inverse:null})
});
