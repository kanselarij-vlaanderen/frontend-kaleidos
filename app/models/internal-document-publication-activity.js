import Model, { attr, belongsTo } from '@ember-data/model';

export default class InternalDocumentPublicationActivity extends Model {
  @attr('datetime') plannedDate;
  @attr('datetime') startDate;

  @belongsTo('meeting') meeting;
  @belongsTo('concept') status;
}
