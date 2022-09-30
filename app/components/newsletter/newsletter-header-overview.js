import Component from '@glimmer/component';
import { action } from '@ember/object';
import moment from 'moment';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { isPresent } from '@ember/utils';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

/**
 * @argument {Meeting} meeting
 */
export default class NewsletterHeaderOverviewComponent extends Component {
  @service intl;
  @service store;
  @service router;
  @service toaster;
  @service newsletterService;
  @service currentSession;

  @tracked mailCampaign;
  @tracked newsletterHTML = null;
  @tracked latestPublicationActivity;

  @tracked showConfirmPublishAll = false;
  @tracked showConfirmPublishBelga = false;
  @tracked showConfirmPublishThemis = false;
  @tracked showConfirmUnpublishThemis = false;
  @tracked showConfirmPublishMail = false;

  constructor() {
    super(...arguments);
    this.loadMailCampaign.perform();
    this.loadLatestPublicationActivity.perform();
  }

  // Scope of the Themis publication from the newsletter-side depends on the most recent publication.
  // - if it's the first publication, only newsitems are published
  // - if latest publication includes documents, republication should also include documents
  get themisPublicationScopes() {
    const scope = [ CONSTANTS.THEMIS_PUBLICATION_SCOPES.NEWSITEMS ];
    const latestPublicationIncludesDocuments = this.latestPublicationActivity?.scope.includes(CONSTANTS.THEMIS_PUBLICATION_SCOPES.DOCUMENTS);
    if (latestPublicationIncludesDocuments) {
      scope.push(CONSTANTS.THEMIS_PUBLICATION_SCOPES.DOCUMENTS);
    }

    return scope;
  }

  @task
  *loadMailCampaign() {
    this.mailCampaign = yield this.args.meeting.mailCampaign;
  }

  @task
  *loadLatestPublicationActivity() {
    this.latestPublicationActivity = yield this.store.queryOne('themis-publication-activity', {
      'filter[meeting][:uri:]': this.args.meeting.uri,
      'filter[status][:uri:]': CONSTANTS.RELEASE_STATUSES.RELEASED,
      sort: '-start-date',
    });
  }

  get shouldShowPrintButton() {
    return this.router.currentRouteName.includes('newsletter.print');
  }

  get isAlreadyPublished() {
    return this.latestPublicationActivity != null &&
      this.latestPublicationActivity.scope.includes(CONSTANTS.THEMIS_PUBLICATION_SCOPES.NEWSITEMS);
  }

  @action
  print() {
    window.print();
  }

  @task
  *publishToMail() {
    try {
      if (yield this.canSendMailCampaign()) {
        yield this.ensureMailCampaign();

        if (this.mailCampaign?.isSent) {
          this.toaster.error(this.intl.t('error-already-sent-newsletter'));
        } else {
          if (yield this.validateMailCampaign()) {
            try {
              yield this.newsletterService.sendMailCampaign(this.mailCampaign.campaignId);
              this.mailCampaign.sentAt = new Date();
              yield this.mailCampaign.save();
              this.toaster.success(this.intl.t('success-publish-newsletter-to-mail'));
            } catch(e) {
              console.log("error sending newsletter", e);
              this.toaster.error(
                this.intl.t('error-send-newsletter'),
                this.intl.t('warning-title')
              );
            }
          }
        }
      } else {
        this.toaster.error(
          this.intl.t('error-cannot-send-newsletter'),
          this.intl.t('warning-title')
        );
      }
      this.showConfirmPublishMail = false;
    } catch (error) {
      console.log(error);
    }
  }

  @task
  *publishToBelga() {
    try {
      yield this.ensureMailCampaign(true);
      yield this.newsletterService.sendToBelga(this.args.meeting.id);
      this.toaster.success(this.intl.t('success-publish-newsletter-to-belga'));
    } catch(e) {
      console.log(e);
      this.toaster.error(
        this.intl.t('error-send-belga'),
        this.intl.t('warning-title')
      );
    }
    this.showConfirmPublishBelga = false;
  }

  @task
  *publishThemis(scope) {
    const status = yield this.store.findRecordByUri('concept', CONSTANTS.RELEASE_STATUSES.RELEASED);
    const now = new Date();
    try {
      const themisPublicationActivity = this.store.createRecord('themis-publication-activity', {
        plannedDate: now,
        startDate: now,
        meeting: this.args.meeting,
        scope,
        status
      });
      yield themisPublicationActivity.save();
      yield this.loadLatestPublicationActivity.perform();
      this.toaster.success(this.intl.t('success-publish-newsletter-to-web'));
    } catch(e) {
      this.toaster.error(
        this.intl.t('error-publish-to-web'),
        this.intl.t('warning-title')
      );
    }
    this.showConfirmPublishThemis = false;
  }

  @task
  *unpublishThemis(scope) {
    const status = yield this.store.findRecordByUri('concept', CONSTANTS.RELEASE_STATUSES.RELEASED);
    const now = new Date();
    try {
      const themisPublicationActivity = this.store.createRecord('themis-publication-activity', {
        plannedDate: now,
        startDate: now,
        meeting: this.args.meeting,
        scope,
        status
      });
      yield themisPublicationActivity.save();
      this.loadLatestPublicationActivity.perform();
      this.toaster.success(this.intl.t('success-unpublish-from-web'));
    } catch(e) {
      this.toaster.error(
        this.intl.t('error-unpublish-from-web'),
        this.intl.t('warning-title')
      );
    }
    this.showConfirmUnpublishThemis = false;
  }

  @task
  *publishToAll(scope) {
    yield this.publishToMail.perform();
    // Although belga is independent of mailchimp, if there is no valid campaign we should maybe avoid sending belga
    // Specific example: no newsletters (for notes) present! we need at least one note to avoid an empty mail/belga
    // A different example is a note without themes, valid for belga but not for mailchimp (no recipients)
    yield this.publishToBelga.perform();
    if (this.currentSession.may('manage-themis-publications')) {
      yield this.publishThemis.perform(scope);
    }

    this.showConfirmPublishAll = false;
  }

  async canSendMailCampaign() {
    const documentPublicationActivity = await this.args.meeting.internalDocumentPublicationActivity;

    let hasDocumentPublicationDate = isPresent(documentPublicationActivity.plannedDate);
    let hasNotas = false;
    let hasThemes = false;

    const agendaitems = await this.args.agenda.agendaitems;
    for (const agendaitem of agendaitems.toArray()) {
      const agendaitemTreatment = await agendaitem.treatment;
      const newsletterItem = await agendaitemTreatment.newsletterInfo;
      const themes = await newsletterItem?.themes;
      if (themes?.length) {
        hasThemes = true;
      } else {
        hasThemes = false;
        break
      }

      const type = await agendaitem.type;
      if (type.uri === CONSTANTS.AGENDA_ITEM_TYPES.NOTA) {
        hasNotas = true;
      }
    }

    return hasDocumentPublicationDate && hasNotas && hasThemes;
  }

  async validateMailCampaign() {
    if (!this.mailCampaign?.campaignId) {
      return false;
    }
    let campaign;
    try {
      campaign = await this.newsletterService.getMailCampaign(this.mailCampaign.campaignId);
    } catch {
      this.toaster.error(
        this.intl.t('error-fetch-newsletter'),
        this.intl.t('warning-title')
      );
      return false;
    }

    const threshold = 10;
    if (
      Math.abs(
        moment(campaign.attributes.createTime).diff(moment(Date.now()), 'minutes')
      ) > threshold
    ) {
      this.toaster.error(
        this.intl.t('error-old-newsletter'),
        this.intl.t('warning-title')
      );
      return false;
    }
    // Campaign is valid
    return true;
  }

  async ensureMailCampaign(silent) {
    if (!this.mailCampaign) {
      this.mailCampaign = await this.newsletterService.createCampaign(this.args.meeting, silent);
    }
  }

  @task
  *deleteCampaign() {
    if (this.mailCampaign?.campaignId) {
      yield this.newsletterService.deleteCampaign(this.mailCampaign.campaignId);
      this.toaster.success(this.intl.t('success-delete-newsletter'));
    }
    this.mailCampaign.destroyRecord();
    yield this.args.meeting.belongsTo('mailCampaign').reload();
    yield this.loadMailCampaign.perform();
  }

  // TODO These are for developers use - in comments for follow up
  /*
  @task
  *downloadBelgaXML() {
    yield this.ensureMailCampaign(true);
    try {
      yield this.newsletterService.downloadBelgaXML(this.args.agenda.id);
    } catch (e) {
      this.toaster.error(
        this.intl.t('error-download-XML'),
        this.intl.t('warning-title')
      );
    }
  }

  @task
  *loadNewsletterHTML() {
    yield this.ensureMailCampaign(true);
    try {
      const html = yield this.newsletterService.getMailCampaignContent(this.mailCampaign.campaignId);
      this.newsletterHTML = html.body;
    } catch (e) {
      this.toaster.error(
        this.intl.t('error-send-newsletter'),
        this.intl.t('warning-title')
      );
    }
  }
  */


  @action
  openConfirmPublishAll() {
    this.showConfirmPublishAll = true;
  }

  @action
  cancelPublishAll() {
    this.showConfirmPublishAll = false;
  }

  @action
  openConfirmPublishMail() {
    this.showConfirmPublishMail = true;
  }

  @action
  cancelPublishMail() {
    this.showConfirmPublishMail = false;
  }

  @action
  openConfirmPublishBelga() {
    this.showConfirmPublishBelga = true;
  }

  @action
  cancelPublishBelga() {
    this.showConfirmPublishBelga = false;
  }

  @action
  openConfirmPublishThemis() {
    this.showConfirmPublishThemis = true;
  }

  @action
  cancelPublishThemis() {
    this.showConfirmPublishThemis = false;
  }

  @action
  openConfirmUnpublishThemis() {
    this.showConfirmUnpublishThemis = true;
  }

  @action
  cancelUnpublishThemis() {
    this.showConfirmUnpublishThemis = false;
  }
}
