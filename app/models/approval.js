import Model, { belongsTo, attr } from '@ember-data/model';

export default Model.extend({
  created: attr('datetime'),
  mandatee: belongsTo('mandatee', {
    inverse: null,
  }),
  agendaitem: belongsTo('agendaitem', {
    inverse: null,
  }),
});
