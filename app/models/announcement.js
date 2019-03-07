import DS from 'ember-data';

let { Model, attr, belongsTo, hasMany } = DS;

export default Model.extend({
  title: attr('string'),
  text: attr('string'),
  created: attr('date'),
  modified: attr('date'),
  agenda: belongsTo('agenda'),
  documentVersions: hasMany('document-version'),
});
