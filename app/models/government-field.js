import DS from 'ember-data';

const { Model, attr, hasMany, belongsTo } = DS;

export default Model.extend({
  label: attr('string'),
  scopeNote: attr('string'),
  altLabel: attr('string'),
  iseCodes: hasMany('ise-code'),
  domain: belongsTo('government-domain', { inverse: null })
});
