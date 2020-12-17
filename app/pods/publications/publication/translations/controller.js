import Controller from '@ember/controller';
import { action } from '@ember/object';
import moment from 'moment';
import CONFIG from 'fe-redpencil/utils/config';
import { tracked } from '@glimmer/tracking';

export default class PublicationTranslationController extends Controller {
  @tracked showLoader = false;

  get activities() {
    return this.model.translationActivities.map((activity) => activity);
  }

  @action
  async cancelExistingTranslationActivity(translationActivity) {
    this.showLoader = true;
    translationActivity.status = CONFIG.ACTIVITY_STATUSSES.withdrawn;
    translationActivity.endDate = moment().utc();
    await translationActivity.save();
    await this.send('refreshModel');
    this.showLoader = false;
  }

  @action
  async markTranslationActivityDone(translationActivity) {
    this.showLoader = true;
    translationActivity.status = CONFIG.ACTIVITY_STATUSSES.closed;
    translationActivity.endDate = moment().utc();
    await translationActivity.save();
    await this.send('refreshModel');
    this.showLoader = false;
  }
}
