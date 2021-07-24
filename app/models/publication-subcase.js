import Model, {
  attr, belongsTo, hasMany
} from '@ember-data/model';
import { isPresent } from '@ember/utils';

export default class PublicationSubcase extends Model {
  @attr shortTitle;
  @attr title;
  @attr('datetime') dueDate; // uiterste publicatiedatum
  @attr('datetime') targetEndDate; // gewenste/gevraagde publicatiedatum
  @attr('datetime') startDate;
  @attr('datetime') endDate; // publicatiedatum
  @attr('datetime') created;
  @attr('datetime') modified;
  @attr proofPrintCorrector;

  @belongsTo('publication-flow') publicationFlow;

  @hasMany('request-activity') requestActivities;
  @hasMany('piece', {
    inverse: 'publicationSubcaseSourceFor',
  }) sourceDocuments;
  @hasMany('piece', {
    inverse: 'publicationSubcaseCorrectionFor',
  }) correctionDocuments;
  @hasMany('proofing-activity') proofingActivities;
  @hasMany('publication-activity') publicationActivities;

  get isFinished() {
    return isPresent(this.endDate);
  }
}
