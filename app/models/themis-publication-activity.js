import Model, { attr, belongsTo } from '@ember-data/model';

export default class ThemisPublicationActivity extends Model {
  @attr('datetime') unconfirmedPublicationTime;
  @attr('datetime') plannedPublicationTime;
  @attr('datetime') startTime;
  @attr('string-set', {
    defaultValue: () => [],
  }) scope;

  @belongsTo('meeting') meeting;
}
