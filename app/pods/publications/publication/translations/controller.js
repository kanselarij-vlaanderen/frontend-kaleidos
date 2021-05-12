import Controller from '@ember/controller';
import {
  action,
  set
} from '@ember/object';
import { inject as service } from '@ember/service';
import moment from 'moment';
import CONFIG from 'frontend-kaleidos/utils/config';
import { tracked } from '@glimmer/tracking';

export default class PublicationTranslationController extends Controller {
  @service publicationService;
  @service configService;

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

  async getConfig(name, defaultValue) {
    return await this.configService.get(name, defaultValue);
  }

  @action
  async showWithdrawalWindow(translationActivity) {
    this.withdrawActivity = translationActivity;
    const subcase = await translationActivity.get('subcase');
    const publicationFlow = await subcase.get('publicationFlow');
    const _case = await publicationFlow.get('case');
    const subject = await this.getConfig('email:withdrawalTranslation:subject', CONFIG.mail.withdrawalTranslation.subject);
    const content = await this.getConfig('email:withdrawalTranslation:content', CONFIG.mail.withdrawalTranslation.content);
    set(this, 'withdrawalContent', await this.activityService.replaceTokens(content, publicationFlow, _case));
    set(this, 'withdrawalSubject', await this.activityService.replaceTokens(subject, publicationFlow, _case));
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

    // TODO new logic with cancellation-activity

    // Update activity.
    translationActivity.withdrawReason = this.withdrawalReason;
    translationActivity.endDate = moment()
      .utc();
    await translationActivity.save();

    // Invalidate local count cache.
    this.publicationService.invalidatePublicationCache();


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
  async markTranslationActivityDone() {
    this.showLoader = true;
    // TODO new logic or delete
    alert('this action is implemented in another ticket');
    this.showLoader = false;
  }
}
