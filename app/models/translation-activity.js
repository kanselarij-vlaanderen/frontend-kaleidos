import Model, {
  attr, belongsTo, hasMany
} from '@ember-data/model';
import { isPresent } from '@ember/utils';

export default class TranslationActivity extends Model {
  // Attributes.
  @attr('string') title;
  @attr('datetime') startDate;
  @attr('datetime') endDate;
  @attr('datetime') dueDate;
  @attr('datetime') targetEndDate;

  // Relations.
  @belongsTo('translation-subcase') subcase;
  @belongsTo('request-activity') requestActivity;
  @belongsTo('language') language;

  @hasMany('piece', {
    inverse: 'translationActivitiesUsedBy',
  }) usedPieces;
  @hasMany('piece', {
    inverse: 'translationActivityGeneratedBy',
  }) generatedPieces;

  get isFinished() {
    return isPresent(this.endDate);
  }
}
