import DS from 'ember-data';

let { Model, attr, belongsTo, hasMany } = DS;

export default Model.extend({
  description: attr("string"),
  shortTitle: attr("string"),
  approved: attr('boolean'),
  archived: attr('boolean'),
  title: attr('string'),
  numberVp: attr('string'),
  numberVr: attr('string'),

  subcase: belongsTo('subcase'),
  publication: belongsTo('publication'),
  newsletterInfo: belongsTo('newsletter-info'),
  documentType: belongsTo('document-type'),
  confidentiality: belongsTo('confidentiality'),
  documentVersions: hasMany('document-version', {inverse:null})
});
