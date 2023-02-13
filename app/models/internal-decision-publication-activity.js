import Model, { attr, belongsTo } from '@ember-data/model';

export default class InternalDecisionPublicationActivity extends Model {
  @attr('datetime') startDate;

  @belongsTo('meeting', {
    inverse: 'internalDecisionPublicationActivity',
    async: true,
  })
  meeting;
  @belongsTo('concept', { inverse: null, async: true }) status;
}
