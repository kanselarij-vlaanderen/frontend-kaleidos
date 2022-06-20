import Model, { attr, belongsTo } from '@ember-data/model';

export default class ThemisPublicationActivity extends Model {
  // time the publication process should be finished
  // setting this property, means approving the plannedStartDate
  @attr('datetime') startDate;
  // time the decisions/documents should be finished under normal conditions
  // this date is approved by setting startDate
  @attr('datetime') plannedStart;
  @attr('stringSet') scope;

  @belongsTo('meeting') meeting;
}
