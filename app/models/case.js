import DS from 'ember-data';

const { Model, attr, hasMany, belongsTo } = DS;

export default Model.extend({
  
  created: attr('date'),
  title: attr('string'),
  shortTitle: attr('string'),
  number: attr('string'),

  caseType: belongsTo('case-type'),
  mandatees: hasMany('mandatee'),
  remark: hasMany('remark'),
  themes: hasMany('theme'),
  subcases: hasMany('subcase'),
  related: hasMany('case'),
  creators: hasMany('person')
  // public: attr('boolean'),
  // modified: attr('date'),
  // archived: attr('boolean'),
  // contact: belongsTo('capacity')
});
