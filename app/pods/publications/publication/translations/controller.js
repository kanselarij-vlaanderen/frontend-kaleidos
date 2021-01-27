import Controller from '@ember/controller';
import { action } from '@ember/object';
import moment from 'moment';
import CONFIG from 'fe-redpencil/utils/config';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class PublicationTranslationController extends Controller {
  @service publicationService;
  @tracked showLoader = false;

  get activities() {
    return this.model.translationActivities.map((activity) => activity);
  }

  @action
  async cancelExistingTranslationActivity(translationActivity) {
    this.showLoader = true;
    const withDrawnStatus = await this.store.findRecord('activity-status', CONFIG.ACTIVITY_STATUSSES.withdrawn.id);
    translationActivity.status = withDrawnStatus;
    translationActivity.endDate = moment().utc();
    await translationActivity.save();

    // Invalidate local count cache.
    this.publicationService.invalidatePublicationCache();

    this.model.refreshAction();
    this.showLoader = false;
  }

  @action
  async markTranslationActivityDone(translationActivity) {
    this.showLoader = true;
    const closedStatus = await this.store.findRecord('activity-status', CONFIG.ACTIVITY_STATUSSES.closed.id);
    translationActivity.status = closedStatus;
    translationActivity.endDate = moment().utc();
    await translationActivity.save();

    // Invalidate local count cache.
    this.publicationService.invalidatePublicationCache();

    this.model.refreshAction();
    this.showLoader = false;
  }
}
