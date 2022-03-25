import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { isPresent } from '@ember/utils';

export default class PublicationSubcase extends Model {
  @attr shortTitle;
  @attr title;
  @attr('datetime') dueDate; // "Limiet vertaling" === uiterste publicatiedatum
  @attr('datetime') targetEndDate; // gewenste/gevraagde publicatiedatum
  @attr('datetime') startDate;
  @attr('datetime') endDate; // publicatiedatum
  @attr('datetime') created;
  @attr('datetime') modified;
  @attr proofPrintCorrector;

  @belongsTo('publication-flow') publicationFlow;
  @hasMany('request-activity') requestActivities;
  @hasMany('proofing-activity') proofingActivities;
  @hasMany('publication-activity') publicationActivities;

  get isOverdue() {
    return this.targetEndDate < Date.now();
  }

  get isFinished() {
    return isPresent(this.endDate);
  }
}
