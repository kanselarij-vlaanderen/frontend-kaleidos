import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;

export default Model.extend({
  numberOfMandatees: attr('number'),
});
