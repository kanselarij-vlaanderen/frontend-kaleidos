/* eslint-disable no-duplicate-imports */
import Service, { inject as service } from '@ember/service';
import CONFIG from 'frontend-kaleidos/utils/config';
import moment from 'moment';

export default class activityService extends Service {
  @service store;
  @service configService;
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
