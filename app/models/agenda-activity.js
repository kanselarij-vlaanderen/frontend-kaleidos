import DS from 'ember-data';

const { Model, attr, belongsTo, hasMany } = DS;

export default Model.extend({
  startDate: attr('datetime'),
  subcase: belongsTo('subcase', { inverse: null }),
  agendaitems: hasMany('agendaitems')
});
