import DS from 'ember-data';

const { Model, belongsTo, attr } = DS;
import { alias } from '@ember/object/computed';

export default Model.extend({
	user: belongsTo('person'),
	gebruiker: alias('user'),
  voEmail: attr('string'),
  phoneNumber: attr('string'),
	voId: attr('string')
});
