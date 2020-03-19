import DS from 'ember-data';
const { Model, attr, hasMany } = DS;
import { alias } from '@ember/object/computed';

export default Model.extend({
  uri: attr(),
  name: attr(),
  identifier: attr(), // OVO-code
  member: hasMany('user'),

  subjectPage: alias('uri')
});
