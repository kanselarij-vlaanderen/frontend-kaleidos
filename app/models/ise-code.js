
import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;

export default Model.extend({
	name: attr("string"),
	code: attr("string"),
	altLabel: attr('string'),
	field: belongsTo('government-field')
});
