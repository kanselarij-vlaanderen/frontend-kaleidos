import Model, { attr, belongsTo } from '@ember-data/model';

export default class SignFlowModel extends Model {
  @attr shortTitle;
  @attr longTitle;
  @attr('date') openingDate;
  @attr('date') closingDate;

  @belongsTo regulationType;
  @belongsTo case;
  @belongsTo signSubcase;
  @belongsTo('agenda-item-treatment') decisionActivity; // TODO: split in decide-activity & agenda-item-treatment
  @belongsTo('person') creator;
}
