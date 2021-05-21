import Model, {
  attr, belongsTo, hasMany
} from '@ember-data/model';

export default class PublicationSubcase extends Model {
  @attr shortTitle;
  @attr title;
  @attr('datetime') dueDate;
  @attr('datetime') targetEndDate;
  @attr('datetime') created;
  @attr('datetime') modified;

  @belongsTo('publication-flow') publicationFlow;

  @hasMany('request-activity') requestActivities;
  @hasMany('proofing-activity') proofingActivities;
  @hasMany('publication-activity') publicationActivities;

  get publicationBeforeDateHasExpired() {
    return this.targetEndDate
      && this.targetEndDate < new Date();
  }

  get publicationDateHasExpired() {
    return this.dueDate
      && this.dueDate < new Date();
  }
}
