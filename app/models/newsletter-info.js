import DS from 'ember-data';

const { Model, attr, hasMany, belongsTo } = DS;

export default Model.extend({
	text: attr('string'),
	subtitle: attr('string'),
	title: attr('string'),
	richtext: attr('string'),
	mandateeProposal: attr('string'),
	finished: attr('boolean'),
	publicationDate: attr('date'),
	publicationDocDate: attr('date'),

	remarks: hasMany('remark', { inverse: null }),
	subcase: belongsTo('subcase'),
	meeting: belongsTo('meeting', { inverse: null }),
	documentVersions: hasMany('document-version', { inverse: null })
});
