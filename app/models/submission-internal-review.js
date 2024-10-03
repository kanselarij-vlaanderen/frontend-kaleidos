import { belongsTo, hasMany, attr } from '@ember-data/model';
import ModelWithModifier from 'frontend-kaleidos/models/model-with-modifier';

export default class SubmissionInternalReviewModel extends ModelWithModifier {
  @attr uri;
  @attr('datetime') created;
  // @attr('datetime') modified; // included in extending ModelWithModifier
  @attr privateComment;

  @belongsTo('subcase', { inverse: 'internalReview', async: true }) subcase;
  @hasMany('submission', { inverse: 'internalReview', async: true }) submissions;
}
