import DS from 'ember-data';

const {
  Model,
  attr,
  belongsTo,
} = DS;

export default Model.extend({
  created: attr('date'),
  mandatee: belongsTo('mandatee', {
    inverse: null,
  }),
  agendaitem: belongsTo('agendaitem', {
    inverse: null,
  }),
});
