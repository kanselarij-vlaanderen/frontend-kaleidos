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

    const requestTranslationActivityType = await  this.store.findRecord('activity-type', CONFIG.ACTIVITY_TYPES.vertalen.id);

    // Create activity.
    const translateActivity = this.store.createRecord('activity', {
      status: CONFIG.ACTIVITY_STATUSSES.open,
      startDate: creationDatetime,
      finalTranslationDate,
      mailContent,
      subcase,
      type: requestTranslationActivityType,
      usedPieces: pieces,
    });

    // Persist to db.
    await translateActivity.save();

    // Reload relation.
    await subcase.hasMany('publicationActivities').reload();


    return translateActivity;
  }

  /**
   * Create a new Publish preview Activity.
   *
   * @param mailContent
   * @param pieces
   * @param subcase
   * @returns {Promise<Model|any|Promise>}
   */
  async createNewPublishPreviewActivity(mailContent, pieces, subcase) {
    const creationDatetime = moment().utc()
      .toDate();

    // publishPreviewActivityType.
    const requestPublishPreviewActivityType = await  this.store.findRecord('activity-type', CONFIG.ACTIVITY_TYPES.drukproeven.id);

    // Create activity.
    const PublishPreviewActivity = this.store.createRecord('activity', {
      status: CONFIG.ACTIVITY_STATUSSES.open,
      startDate: creationDatetime,
      mailContent,
      subcase,
      type: requestPublishPreviewActivityType,
      usedPieces: pieces,
    });

    // Persist to db.
    await PublishPreviewActivity.save();

    // Reload relation.
    await subcase.hasMany('publicationActivities').reload();

    return PublishPreviewActivity;
  }

  /**
   * Create a publish to BS activity.
   *
   * @param mailContent
   * @param pieces
   * @param subcase
   * @param activity
   * @returns {Promise<Model|any|Promise>}
   */
  async createNewPublishActivity(mailContent, pieces, subcase, publishPreviewActivity) {
    const creationDatetime = moment().utc()
      .toDate();

    // publishActivityType.
    const requestPublishActivityType = await  this.store.findRecord('activity-type', CONFIG.ACTIVITY_TYPES.publiceren.id);

    // Create activity.
    const PublishPreviewActivity = this.store.createRecord('activity', {
      status: CONFIG.ACTIVITY_STATUSSES.open,
      startDate: creationDatetime,
      mailContent,
      subcase,
      type: requestPublishActivityType,
      usedPieces: pieces,
      publishes: publishPreviewActivity,
    });

    // Persist to db.
    await PublishPreviewActivity.save();

    // Reload relations.
    await subcase.hasMany('publicationActivities').reload();
    await publishPreviewActivity.hasMany('publishedBy').reload();

    return PublishPreviewActivity;
  }
}
