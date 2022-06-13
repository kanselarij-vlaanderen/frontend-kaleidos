import Model, { attr, belongsTo } from '@ember-data/model';

export default class DocumentPublicationActivity extends Model {
  @attr('datetime') start;
  @attr('datetime') plannedStart;

  @belongsTo('meeting') meeting;
}
