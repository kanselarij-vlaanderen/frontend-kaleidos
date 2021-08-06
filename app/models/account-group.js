import Model, { attr, hasMany } from '@ember-data/model';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes
export default Model.extend({
  uri: attr(),
  name: attr(),
  users: hasMany('user'),
});
