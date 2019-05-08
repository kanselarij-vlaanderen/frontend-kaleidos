
import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;

export default Model.extend({
	name: attr("string"),
	code: attr("string"),
	domain: belongsTo('government-domain')
});
