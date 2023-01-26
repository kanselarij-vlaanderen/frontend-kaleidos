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

  @belongsTo('publication-flow', { inverse: 'publicationSubcase', async: true })
  publicationFlow;

  @hasMany('request-activity', { inverse: 'publicationSubcase', async: true })
  requestActivities;
  @hasMany('proofing-activity', { inverse: 'subcase', async: true })
  proofingActivities;
  @hasMany('publication-activity', { inverse: 'subcase', async: true })
  publicationActivities;

  get isOverdue() {
    return this.targetEndDate < Date.now();
  }

  get isFinished() {
    return isPresent(this.endDate);
  }
}
