import DS from 'ember-data';

const { attr, Model, belongsTo } = DS;

export default Model.extend({
	beginDate: attr('date'),
  endDate: attr('date'),
  title: attr('string'),
  message: attr('string'),
  type: belongsTo('alert-type'),
});
