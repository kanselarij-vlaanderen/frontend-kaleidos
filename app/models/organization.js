import DS from 'ember-data';
import { alias } from '@ember/object/computed';

const {
  Model, attr, hasMany,
} = DS;

export default Model.extend({
  uri: attr(),
  name: attr(),
  identifier: attr(), // OVO-code
  member: hasMany('user'),

  subjectPage: alias('uri'),
});
