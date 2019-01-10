import DS from 'ember-data';

const { Model, attr } = DS;

export default Model.extend({
  public: attr('boolean'),
  created: attr('string'),
  archived: attr('boolean'),
  shortTitle: attr('string'),
  number: attr('string'),
  remark: attr('string'),
  title: attr('string')
});
