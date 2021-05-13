/* eslint-disable no-duplicate-imports */
import Service, { inject as service } from '@ember/service';
import CONFIG from 'frontend-kaleidos/utils/config';
import moment from 'moment';

export default class activityService extends Service {
  @service store;
  @service toaster;
  @service configService;
  @service publicationService;
  @service intl;

  /**
   * Get case title.
   *
   * @param _case
   * @returns {*}
   */
  caseTitleFromCase(_case) {
    const shortTitle = _case.shortTitle;
    if (shortTitle) {
      return shortTitle;
    }
    return _case.title;
  }

  // TODO email stuff, does this belong here ?
  /**
   * Replace activity Tokens.
   *
   * @param string
   * @param publicationFlow
   * @param _case
   * @returns {Promise<*>}
   */
  async replaceTokens(defaultString, publicationFlow, _case) {
    let outputString = defaultString;
    outputString = outputString.replace('%%nummer%%', publicationFlow.publicationNumber);
    outputString = outputString.replace('%%titel%%', this.caseTitleFromCase(_case));
    outputString = outputString.replace('%%footer%%', await this.configService.get('email:footer', CONFIG.mail.defaultFooter));
    outputString = outputString.replace('%%kaleidosenvironment%%', window.location.origin);
    return outputString;
  }

  /**
   * Create a new Translation Activity.
   *
   * @param finalTranslationDate
   * @param mailContent
   * @param mailSubject
   * @param pieces
   * @param subcase
   * @returns {Promise<Model|any|Promise>}
   */
  async createNewTranslationActivity(finalTranslationDate, mailContent, mailSubject, pieces, subcase) {
    const creationDatetime = moment()
      .utc()
      .toDate();

    // TODO new logic needed with request-activity and email

    // Create activity.
    const translateActivity = this.store.createRecord('translation-activity', {
      startDate: creationDatetime,
      finalTranslationDate,
      mailContent,
      mailSubject,
      subcase,
      usedPieces: pieces,
    });

    // Persist to db.
    await translateActivity.save();

    // Reload relation.
    await subcase.hasMany('translationActivities')
      .reload();


    return translateActivity;
  }

  /**
   * Create a new Publish preview Activity.
   *
   * @param mailContent
   * @param mailSubject
   * @param pieces
   * @param subcase
   * @returns {Promise<Model|any|Promise>}
   */
  async createNewPublishPreviewActivity(mailContent, mailSubject, pieces, subcase) {
    const creationDatetime = moment()
      .utc()
      .toDate();

    // TODO new logic needed with request-activity and email
    // publishPreviewActivityType.

    // Create activity.
    const PublishPreviewActivity = this.store.createRecord('proofing-activity', {
      startDate: creationDatetime,
      mailContent,
      mailSubject,
      subcase,
      usedPieces: pieces,
    });

    // Persist to db.
    await PublishPreviewActivity.save();

    // Reload relation.
    await subcase.hasMany('proofingActivities')
      .reload();

    return PublishPreviewActivity;
  }

  /**
   * Create a publish to BS activity.
   *
   * @param mailContent
   * @param pieces
   * @param subcase
   * @returns {Promise<Model|any|Promise>}
   */
  async createNewPublishActivity(mailContent, pieces, subcase) {
    const creationDatetime = moment()
      .utc()
      .toDate();

    // TODO new logic needed with request-activity and email
    // publishActivityType.

    // Create activity.
    // TODO rename variable if used in new logic
    const PublishPreviewActivity = this.store.createRecord('publication-activity', {
      startDate: creationDatetime,
      mailContent,
      subcase,
      usedPieces: pieces,
    });

    // Persist to db.
    await PublishPreviewActivity.save();

    // Reload relations.
    await subcase.hasMany('publicationActivities')
      .reload();

    return PublishPreviewActivity;
  }
}
