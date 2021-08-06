import Model, { attr, hasMany } from '@ember-data/model';

export default Model.extend({
  uri: attr(),
  name: attr(),
  users: hasMany('user'),
});
