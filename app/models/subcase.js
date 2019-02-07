import DS from 'ember-data';

const { attr, Model, hasMany, belongsTo } = DS;

export default Model.extend({
  created: attr('string'),
  shortTitle: attr('string'),
  remark: attr('string'),
  title: attr('string'),
  case: belongsTo('case'),
  session: belongsTo('session'),
  agendaitem: belongsTo('agendaitem', {inverse:null}),
  showAsComment: attr('boolean'),
  confidential: attr('boolean'),
  documents: hasMany('document')
});
