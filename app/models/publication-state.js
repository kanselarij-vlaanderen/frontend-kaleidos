import DS from 'ember-data';

const { Model, attr, hasMany, belongsTo } = DS;

export default Model.extend({
	date: attr('date'),
	publication: belongsTo('publication'),
	state: belongsTo('publication-state-code'),
	remarks: hasMany('remark')
});
