import Model, { attr, belongsTo } from '@ember-data/model';
import { alias } from '@ember/object/computed';

export default Model.extend({
  user: belongsTo('person'),
  gebruiker: alias('user'),
  voId: attr('string'),
});
