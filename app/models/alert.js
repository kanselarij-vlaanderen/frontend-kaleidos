import DS from 'ember-data';

const { attr, Model, belongsTo } = DS;

export default Model.extend({
  beginDate: attr('datetime'),
  endDate: attr('datetime'),
  title: attr('string'),
  message: attr('string'),
  type: belongsTo('alert-type'),
});
