import Model, {
  attr, belongsTo, hasMany
} from '@ember-data/model';

export default class PublicationSubcase extends Model {
  @attr shortTitle;
  @attr title;
  @attr('datetime') dueDate; // uiterste publicatiedatum
  @attr('datetime') targetEndDate; // gewenste publicatiedatum
  @attr('datetime') endDate; // publicatiedatum
  @attr('datetime') created;
  @attr('datetime') modified;

  @belongsTo('publication-flow') publicationFlow;

  @hasMany('request-activity') requestActivities;
  @hasMany('proofing-activity') proofingActivities;
  @hasMany('publication-activity') publicationActivities;
}
