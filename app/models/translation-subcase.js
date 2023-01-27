import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { isPresent } from '@ember/utils';
import { isBefore, startOfDay } from 'date-fns';

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

  get isOverdue() {
    return isBefore(startOfDay(this.dueDate), startOfDay(new Date()));
  }

  get isFinished() {
    return isPresent(this.endDate);
  }
}
