import Model, { attr, belongsTo } from '@ember-data/model';

export default class ThemisPublicationActivity extends Model {
  @attr('datetime') startDate;
  @attr('datetime') plannedStart;
  @attr('stringSet') scope;

  @belongsTo('meeting') meeting;
}
