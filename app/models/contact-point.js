import DS from 'ember-data';

const { Model, attr } = DS;

export default Model.extend({
	country: attr('string'),
	municipality: attr('string'),
	address: attr('string'),
	postalCode: attr('string'),
	email: attr('string'),
	telephone: attr('string'),
	fax: attr('string'),
	website: attr('string')
});