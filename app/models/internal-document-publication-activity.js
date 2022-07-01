import Model, { attr, belongsTo } from '@ember-data/model';

export default class InternalDocumentPublicationActivity extends Model {
  @attr('datetime') unconfirmedPublicationTime;
  @attr('datetime') plannedPublicationTime;
  @attr('datetime') startTime;

  @belongsTo('meeting') meeting;
}
