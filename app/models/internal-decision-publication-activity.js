import Model, { attr, belongsTo } from '@ember-data/model';

export default class InternalDecisionPublicationActivity extends Model {
  @attr('datetime') startTime;

  @belongsTo('meeting') meeting;
}
