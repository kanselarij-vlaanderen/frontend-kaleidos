import Model, {
  attr, belongsTo
} from '@ember-data/model';

export default class TranslationSubcase extends Model {
  @attr shortTitle;
  @attr title;
  @attr('datetime') created;
  @attr('datetime') modified;

  @belongsTo('publication-flow') publicationFlow;

  @belongsTo('request-activity') requestActivities;
  @belongsTo('translation-activity') translationActivities;
  @belongsTo('cancellation-activity') cancellationActivities;
}
