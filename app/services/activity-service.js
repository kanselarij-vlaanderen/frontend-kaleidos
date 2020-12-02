/* eslint-disable no-duplicate-imports */
import { inject as service } from '@ember/service';
import Service from '@ember/service';
import CONFIG from 'fe-redpencil/utils/config';
import moment from 'moment';
export default class activityService extends Service {
  @service store;
  @service toaster;
  @service intl;

  /**
   * Create a new Translation Activity.
   *
   * @param finalTranslationDate
   * @param mailContent
   * @param pieces
   * @param subcase
   * @returns {Promise<Model|any|Promise>}
   */
  async createNewTranslationActivity(finalTranslationDate, mailContent, pieces, subcase) {
    const creationDatetime = moment().utc()
      .toDate();
    const activityType = await  this.store.findRecord('activity-type', CONFIG.ACTIVITY_TYPES.vertalen.id);
    const translateActivity = this.store.createRecord('activity', {
      startDate: creationDatetime,
      finalTranslationDate,
      mailContent,
      subcase,
      activityType,
      usedPieces: pieces,
    });
    await translateActivity.save();
    await subcase.belongsTo('activity').reload();
    return translateActivity;
  }
}
