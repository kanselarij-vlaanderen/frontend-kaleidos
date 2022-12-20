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

  @belongsTo('publication-flow', { inverse: 'translationSubcase', async: true })
  publicationFlow;

  @hasMany('request-activity', { inverse: 'translationSubcase', async: true })
  requestActivities;
  @hasMany('translation-activity', { inverse: 'subcase', async: true })
  translationActivities;
  @hasMany('cancellation-activity', { inverse: 'subcase', async: true })
  cancellationActivities;

  get isOverdue() {
    return moment(this.dueDate).isBefore(Date.now(), 'day');
  }

  get isFinished() {
    return isPresent(this.endDate);
  }
}
