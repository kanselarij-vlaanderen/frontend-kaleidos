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
    const withDrawnStatus = await this.store.findRecord('activity-status', CONFIG.ACTIVITY_STATUSSES.withdrawn.id);
    translationActivity.status = withDrawnStatus;
    translationActivity.endDate = moment()
      .utc();
    await translationActivity.save();
    this.model.refreshAction();
    this.showLoader = false;
  }

  @action
  async markTranslationActivityDone(translationActivity) {
    this.showLoader = true;
    const openStatus = await this.store.findRecord('activity-status', CONFIG.ACTIVITY_STATUSSES.open.id);
    const closedStatus = await this.store.findRecord('activity-status', CONFIG.ACTIVITY_STATUSSES.closed.id);
    const translationActivityStatus = await translationActivity.get('status');

    if (translationActivityStatus.id === closedStatus.id) {
      translationActivity.status = openStatus;
      translationActivity.endDate = null;
      await translationActivity.save();
    } else {
      translationActivity.status = closedStatus;
      translationActivity.endDate = moment()
        .utc();
      await translationActivity.save();
    }
    this.model.refreshAction();
    this.showLoader = false;
  }
}
