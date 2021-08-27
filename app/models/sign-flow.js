import Model, { attr, belongsTo } from '@ember-data/model';

export default class SignFlowModel extends Model {
  @attr shortTitle;
  @attr title;
  @attr('date') openingDate;
  @attr('date') closingDate;

  @belongsTo regulationType;
  @belongsTo('sign-status') status;
  @belongsTo case;
  @belongsTo signSubcase;
  @belongsTo('agenda-item-treatment') decideActivity; // TODO: split in decide-activity & agenda-item-treatment
  @belongsTo('person') councelor;
}
