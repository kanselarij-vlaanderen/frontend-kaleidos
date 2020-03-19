import DS from 'ember-data';

const { Model, attr } = DS;

export default Model.extend({
  type: attr('string'),
  serviceName: attr('string'),
  unixTimestamp: attr('unix-to-datetime'),
  state: attr('string')
});
