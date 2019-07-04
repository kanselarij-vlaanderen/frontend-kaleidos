import DS from 'ember-data';

let { Model, attr, belongsTo, hasMany } = DS;

export default Model.extend({
  richtext: attr("string"),
  shortTitle: attr("string"),
  approved: attr('boolean'),
  archived: attr('boolean'),
  title: attr('string'),
  numberVp: attr('string'),
  numberVr: attr('string'),

  subcase: belongsTo('subcase', { inverse: null }),
  publication: belongsTo('publication'),
  documentType: belongsTo('document-type'),
  documentVersions: hasMany('document-version', { inverse: null }),
  signedDocument: belongsTo('document'),
});
