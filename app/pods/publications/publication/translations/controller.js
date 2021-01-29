import Controller from '@ember/controller';
import {
  action,
  set
} from '@ember/object';
import { inject as service } from '@ember/service';
import moment from 'moment';
import CONFIG from 'fe-redpencil/utils/config';
import { tracked } from '@glimmer/tracking';

export default class PublicationTranslationController extends Controller {
  // Tracked.
  @tracked showLoader = false;
  @tracked showWithdrawPopup = false;
  @tracked withdrawalContent = '';
  @tracked withdrawalSubject = '';
  @tracked withdrawActivity = null;
  @tracked withdrawalReason = '';

  // Services.
  @service activityService;
  @service emailService;

  get activities() {
    return this.model.translationActivities.map((activity) => activity);
  }

  @action
  async showWithdrawalWindow(translationActivity) {
    this.withdrawActivity = translationActivity;
    const subcase = await translationActivity.get('subcase');
    const publicationFlow = await subcase.get('publicationFlow');
    const _case = await publicationFlow.get('case');
    set(this, 'withdrawalContent', this.activityService.replaceTokens(CONFIG.mail.withdrawalTranslation.content, publicationFlow, _case));
    set(this, 'withdrawalSubject', this.activityService.replaceTokens(CONFIG.mail.withdrawalTranslation.subject, publicationFlow, _case));
    this.showWithdrawPopup = true;
  }

  @action
  hideWithdrawalWindow() {
    this.withdrawalReason = '';
    this.withdrawalSubject = '';
    this.withdrawalContent = '';
    this.withdrawActivity = null;
    this.showWithdrawPopup = false;
  }

  @action
  async cancelExistingTranslationActivity() {
    const translationActivity = this.withdrawActivity;
    this.showWithdrawPopup = false;
    this.showLoader = true;

    // Update activity.
    const withDrawnStatus = await this.store.findRecord('activity-status', CONFIG.ACTIVITY_STATUSSES.withdrawn.id);
    translationActivity.status = withDrawnStatus;
    translationActivity.withdrawReason = this.withdrawalReason;
    translationActivity.endDate = moment().utc();
    await translationActivity.save();

    const pieces = await translationActivity.get('usedPieces');
    // Send email
    this.emailService.sendEmail(CONFIG.EMAIL.DEFAULT_FROM, CONFIG.EMAIL.TO.activityWithdrawTranslationsEmail, this.withdrawalSubject, this.withdrawalContent, pieces);

    // Reset local state.
    this.model.refreshAction();
    this.withdrawalReason = '';
    this.withdrawalSubject = '';
    this.withdrawalContent = '';
    this.withdrawActivity = null;
    this.showLoader = false;
  }

  @action
  async markTranslationActivityDone(translationActivity) {
    this.showLoader = true;
    const closedStatus = await this.store.findRecord('activity-status', CONFIG.ACTIVITY_STATUSSES.closed.id);
    translationActivity.status = closedStatus;
    translationActivity.endDate = moment().utc();
    await translationActivity.save();
    this.model.refreshAction();
    this.showLoader = false;
  }
}
