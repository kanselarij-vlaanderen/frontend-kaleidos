import DS from 'ember-data';

const { Model, attr, hasMany, belongsTo } = DS;

export default Model.extend({
  public: attr('boolean'),
  created: attr('date'),
  modified: attr('date'),
  archived: attr('boolean'),
  shortTitle: attr('string'),
  number: attr('string'),
  remark: attr('string'),
  title: attr('string'),
  themes: hasMany('theme'),
  subcases: hasMany('subcase'),
  contact: belongsTo('capacity')
});
