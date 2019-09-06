import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;

export default Model.extend({
  firstName: attr('string'),
  lastName: attr('string'),
  rijksregisterNummer: attr('string'),
  account: belongsTo('account'),
  group: belongsTo('account-group', { inverse: null })
});
