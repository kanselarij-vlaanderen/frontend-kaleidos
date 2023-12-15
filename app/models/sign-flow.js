import Model, { attr, belongsTo } from '@ember-data/model';

export default class SignFlowModel extends Model {
  @attr uri;
  @attr shortTitle;
  @attr longTitle;
  @attr('date') openingDate;
  @attr('date') closingDate;

  @belongsTo('sign-subcase', { inverse: 'signFlow', async: true }) signSubcase;
  @belongsTo('regulation-type', { inverse: 'signFlows', async: true })
  regulationType;
  @belongsTo('case', { inverse: 'signFlows', async: true }) case;
  @belongsTo('decision-activity', { inverse: 'signFlows', async: true })
  decisionActivity;
  @belongsTo('meeting', { inverse: 'signFlows', async: true })
  meeting;
  @belongsTo('user', { inverse: null, async: true }) creator;
  @belongsTo('concept', { inverse: null, async: true }) status;
}
