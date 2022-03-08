import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { isPresent } from '@ember/utils';
import moment from 'moment';

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
    return moment(this.dueDate).isBefore(Date.now(), 'day');
  }

  get isFinished() {
    return isPresent(this.endDate);
  }
}
