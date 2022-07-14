import Model, { attr, belongsTo } from '@ember-data/model';

export default class ThemisPublicationActivity extends Model {
  @attr('datetime') plannedPublicationTime;
  @attr('datetime') startDate;
  @attr('string-set', {
    defaultValue: () => [],
  }) scope;

  @belongsTo('meeting') meeting;
  @belongsTo('release-status') status;
}
