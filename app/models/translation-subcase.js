import Model, {
  attr, belongsTo, hasMany
} from '@ember-data/model';

export default class TranslationSubcase extends Model {
  @attr shortTitle;
  @attr title;
  @attr('datetime') dueDate;
  @attr('datetime') targetEndDate;
  @attr('datetime') created;
  @attr('datetime') modified;

  @belongsTo('publication-flow') publicationFlow;

  @hasMany('request-activity') requestActivities;
  @hasMany('translation-activity') translationActivities;
  @hasMany('cancellation-activity') cancellationActivities;
}
