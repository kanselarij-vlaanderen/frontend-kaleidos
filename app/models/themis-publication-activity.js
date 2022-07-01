import Model, { attr, belongsTo } from '@ember-data/model';

export default class ThemisPublicationActivity extends Model {
  @attr('datetime') unconfirmedPublicationTime;
  @attr('datetime') plannedPublicationTime;
  @attr('datetime') startTime;
  @attr('stringSet') scope;

  @belongsTo('meeting') meeting;
}
