import DS from 'ember-data';

const { Model, attr, hasMany } = DS;

export default Model.extend({
	targetLanguage: attr('string'),
	expectedDeliveryDate: attr('date'),
	documentVersions: hasMany('document-version'),
	states: hasMany('translation-state'),
	remarks: hasMany('remark')
});
