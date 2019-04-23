import DS from 'ember-data';

const { Model, belongsTo } = DS;
import { alias } from '@ember/object/computed';

export default Model.extend({
	user: belongsTo('person'),
	gebruiker: alias('user')
});
