import DS from 'ember-data';
import { alias } from '@ember/object/computed';

const {
  Model,
  belongsTo,
  attr,
} = DS;

export default Model.extend({
  user: belongsTo('person'),
  gebruiker: alias('user'),
  voId: attr('string'),
  created: attr('datetime'),
  lastLogin: attr('datetime'),
});
