import Model, { attr, belongsTo } from '@ember-data/model';

export default class SignFlowModel extends Model {
  @attr shortTitle;
  @attr longTitle;
  @attr('date') openingDate;
  @attr('date') closingDate;

  @belongsTo('sign-subcase') signSubcase;
  @belongsTo('regulation-type') regulationType;
  @belongsTo('case') case;
  @belongsTo('decision-activity') decisionActivity;
  @belongsTo('user') creator;
}
