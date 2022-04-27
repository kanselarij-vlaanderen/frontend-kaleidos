import Model, { belongsTo, attr } from '@ember-data/model';

export default class Approval extends Model {
  @attr('datetime') created;
  @belongsTo('agendaitem', { inverse: null }) agendaitem;
  @belongsTo('mandatee', { inverse: null }) mandatee;

}
