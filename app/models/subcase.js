import DS from 'ember-data';

const { attr, Model, hasMany, belongsTo } = DS;

export default Model.extend({
  created: attr('string'),
  shortTitle: attr('string'),
  title: attr('string'),
  confidentiality: attr('string'),
  showAsRemark: attr('boolean'),

  case: belongsTo('case'),
  relatedTo: hasMany('subcase'),
  meeting: belongsTo('meeting'),
  phase: belongsTo('subcase-phase'),
  consulationRequests: hasMany('consulation-request'),
  agendaitem: hasMany('agendaitem'),
  remarks: hasMany('remark'),
  documentVersions: hasMany('document-version')
});
