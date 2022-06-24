import Model, { attr, belongsTo } from '@ember-data/model';

export default class InternalDocumentPublicationActivity extends Model {
  @attr('datetime') startDate;
  @attr('datetime') plannedStart;

  @belongsTo('meeting') meeting;
}
