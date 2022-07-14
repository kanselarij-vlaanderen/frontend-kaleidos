import Model, { attr, belongsTo } from '@ember-data/model';

export default class InternalDocumentPublicationActivity extends Model {
  @attr('datetime') plannedPublicationTime;
  @attr('datetime') startDate;

  @belongsTo('meeting') meeting;
  @belongsTo('release-status') status;
}
