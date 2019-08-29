import DS from 'ember-data';

const { Model, attr, hasMany, belongsTo } = DS;

export default Model.extend({
  firstName: attr('string'),
  lastName: attr('string'),
  rijksregisterNummer: attr('string'),
  accounts: hasMany('account'),
  group: belongsTo('account-group', { inverse: null })
});
