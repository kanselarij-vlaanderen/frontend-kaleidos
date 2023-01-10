import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { isPresent } from '@ember/utils';

export default class TranslationActivity extends Model {
  // Attributes.
  @attr('string') title;
  @attr('datetime') startDate;
  @attr('datetime') endDate;
  @attr('datetime') dueDate;
  @attr('datetime') targetEndDate;

  // Relations.
  @belongsTo('translation-subcase', {
    inverse: 'translationActivity',
    async: true,
  })
  subcase;
  @belongsTo('request-activity', { inverse: 'translationActivity', async: true })
  requestActivity;
  @belongsTo('language', { inverse: null, async: true }) language;

  @hasMany('piece', {
    inverse: 'translationActivitiesUsedBy',
    async: true,
  })
  usedPieces;
  @hasMany('piece', {
    inverse: 'translationActivityGeneratedBy',
    async: true,
  })
  generatedPieces;

  get isFinished() {
    return isPresent(this.endDate);
  }
}
