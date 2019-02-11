import DS from 'ember-data';

const { Model, attr, hasMany, belongsTo } = DS;

export default Model.extend({
	created: attr('date'),
	public: attr('boolean'),
	documentType: attr('string'),
	documentVersions: hasMany('document-versions'),
	subcase: belongsTo('subcase')
});
