import Model, { attr, belongsTo } from '@ember-data/model';

export default class ThemisPublicationActivity extends Model {
  @attr('datetime') plannedDate;
  @attr('datetime') startDate;
  @attr('string-set', {
    defaultValue: () => [],
  })
  scope;

  @belongsTo('meeting', { inverse: 'themisPublicationActivities', async: true })
  meeting;
  @belongsTo('concept', { inverse: null, async: true }) status;
}
