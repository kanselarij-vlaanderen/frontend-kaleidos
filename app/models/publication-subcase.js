import Model, {
  attr, belongsTo
} from '@ember-data/model';

export default class PublicationSubcase extends Model {
  @attr shortTitle;
  @attr title;
  @attr('datetime') created;
  @attr('datetime') modified;

  @belongsTo('publication-flow') publicationFlow;

  @belongsTo('request-activity') requestActivities;
  @belongsTo('proofing-activity') proofingActivities;
  @belongsTo('publication-activity') publicationActivities;
}
