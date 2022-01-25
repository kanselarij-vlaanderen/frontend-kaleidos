import Model, { attr, belongsTo } from '@ember-data/model';

export default class ThemisPublicationActivity extends Model {
  @attr('datetime') startDate;
  @attr('stringSet') scope;

  @belongsTo('meeting') meeting;
}
