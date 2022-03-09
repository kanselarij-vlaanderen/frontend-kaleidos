import Model, { attr, belongsTo } from '@ember-data/model';
import { alias } from '@ember/object/computed';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes
export default Model.extend({
  user: belongsTo('user'),
  gebruiker: alias('user'),
  voId: attr('string'),
});
