import DS from 'ember-data';

const { attr, Model, belongsTo } = DS;

export default Model.extend({
  created: attr('string'),
  shortTitle: attr('string'),
  remark: attr('string'),
  title: attr('string'),
  case: belongsTo('case')
});
