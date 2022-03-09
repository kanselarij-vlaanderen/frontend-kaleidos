import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { isPresent } from '@ember/utils';
import moment from 'moment';

export default class TranslationSubcase extends Model {
  @attr shortTitle;
  @attr title;
  @attr('datetime') dueDate; // Limiet vertaling === uiterste/gevraagde vertaaldatum
  @attr('datetime') targetEndDate; // not used ?
  @attr('datetime') startDate;
  @attr('datetime') endDate;
  @attr('datetime') created;
  @attr('datetime') modified;

  @belongsTo('publication-flow') publicationFlow;

  @hasMany('request-activity') requestActivities;
  @hasMany('translation-activity') translationActivities;
  @hasMany('cancellation-activity') cancellationActivities;

  get isOverdue() {
    return moment(this.dueDate).isBefore(Date.now(), 'day');
  }

  get isFinished() {
    return isPresent(this.endDate);
  }
}
