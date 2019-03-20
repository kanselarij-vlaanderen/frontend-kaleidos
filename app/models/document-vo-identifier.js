import DS from 'ember-data';
const { Model, attr, belongsTo } = DS;

export default Model.extend({
  serialNumber: attr('string'),
  versionNumber: attr('number'),
  title: attr('string'),
  documentVersion: belongsTo('document-version', {inverse: null}),
  meeting: belongsTo('meeting', {inverse: null}),
  subcase: belongsTo('subcase', {inverse: null})

});
