import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { isEmpty } from '@ember/utils';

export default class PublicationActivity extends Model {
  @attr('string') title;
  @attr('datetime') startDate;
  @attr('datetime') endDate;

  @belongsTo('publication-subcase', {
    inverse: 'publicationActivities',
    async: true,
  })
  subcase;
  @belongsTo('request-activity', {
    inverse: 'publicationActivity',
    async: true,
  })
  requestActivity;

  @hasMany('piece', {
    inverse: 'publicationActivitiesUsedBy',
    async: true,
    polymorphic: true,
  })
  usedPieces;
  @hasMany('decision', { inverse: 'publicationActivity', async: true })
  decisions;

  get isFinished() {
    return !isEmpty(this.endDate);
  }
}
