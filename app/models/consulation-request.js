import DS from 'ember-data';

const { Model, attr, hasMany, belongsTo } = DS;

export default Model.extend({
  request: attr('string'),
  date: attr('datetime'),
  subcase: belongsTo('subcase'),
  type: belongsTo('consulation-type'),
  contactPerson: belongsTo('person'),
  response: belongsTo('consulation-response'),
  remarks: hasMany('remark')
});
