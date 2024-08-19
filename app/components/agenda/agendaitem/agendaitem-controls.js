import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { isEnabledCabinetSubmissions, isEnabledVlaamsParlement } from 'frontend-kaleidos/utils/feature-flag';

export default class AgendaitemControls extends Component {
  /**
   * @argument agendaitem
   * @argument agendaActivity
   * @argument currentAgenda
   * @argument reverseSortedAgendas
   * @argument onDeleteAgendaitem
   */
  @service store;
  @service intl;
  @service agendaService;
  @service currentSession;
  @service pieceAccessLevelService;
  @service signatureService;
  @service decisionReportGeneration;
  @service parliamentService;
  @service newsletterService;
  @service cabinetMail;

  @tracked isVerifying = false;
  @tracked isVerifyingSendBack = false;
  @tracked showLoader = false;
  @tracked isDesignAgenda;
  @tracked decisionActivity;
  @tracked showVPModal = false;
  @tracked canSendToVP = false;
  @tracked isSendingBackToSubmitter = false;
  @tracked sendBackToSubmitterComment;

  constructor() {
    super(...arguments);

    this.loadAgendaData.perform();
    this.loadDecisionActivity.perform();
    this.loadCanSendToVP.perform();
    this.loadSubmissions.perform();
  }

  loadCanSendToVP = task(async () => {
    if (!isEnabledVlaamsParlement() || !this.args.subcase) {
      this.canSendToVP = false;
      return;
    }

    if (this.currentSession.may('send-only-specific-cases-to-vp')) {
      const submitter = await this.args.subcase.requestedBy;
      const currentUserOrganization = await this.currentSession.organization;
      const currentUserOrganizationMandatees = await currentUserOrganization.mandatees;
      const currentUserOrganizationMandateesUris = currentUserOrganizationMandatees.map((mandatee) => mandatee.uri);
      if (currentUserOrganizationMandateesUris.includes(submitter?.uri)) {
        this.canSendToVP = await this.parliamentService.isReadyForVp(this.args.agendaitem);
      } else {
        this.canSendToVP = false;
      }
    } else if (this.currentSession.may('send-cases-to-vp')) {
      this.canSendToVP = await this.parliamentService.isReadyForVp(this.args.agendaitem);
    } else {
      this.canSendToVP = false;
    }
  });

  get hasDropdownOptions() {
    return (
      (this.currentSession.may('manage-agendaitems') && this.isDesignAgenda) ||
      this.canSendToVP
    );
  }

  @action
  async onSendToVp(job, toast) {
    this.showVPModal = false;
    if (this.args.onSendToVp) {
      this.args.onSendToVp(job, toast);
    }
  }

  get areDecisionActionsEnabled() {
    const agendaActivity = this.args.agendaActivity;
    if (!agendaActivity) {
      // In case of legacy agendaitems without a link to subcase (old) or agenda-activity
      // Or in case of the agendaitem to approve minutes ("verslag vorige vergadering")
      return false;
    }
    return !!(
      this.args.reverseSortedAgendas &&
      this.args.reverseSortedAgendas.length > 1
    );
  }

  get isDeletable() {
    const agendaActivity = this.args.agendaActivity;
    if (!this.isDesignAgenda) {
      return false;
    }
    if (agendaActivity) {
      const agendaitems = agendaActivity.get('agendaitems');
      return !(agendaitems && agendaitems.length > 1);
    }
    return true;
  }

  get agendaItemWasSubmitted() {
    return this.submissions?.length === 1 && isEnabledCabinetSubmissions();
  }

  get deleteWarningText() {
    if (this.isDeletable) {
      return this.intl.t('delete-agendaitem-message');
    }
    if (this.currentSession.may('remove-approved-agendaitems')) {
      return this.intl.t('delete-agendaitem-from-meeting-message');
    }
    return null;
  }

  @task
  *loadAgendaData() {
    const status = yield this.args.currentAgenda.status;
    this.isDesignAgenda = status.isDesignAgenda;
  }

  @task
  *loadDecisionActivity() {
    const treatment = yield this.args.agendaitem.treatment;
    this.decisionActivity = yield treatment?.decisionActivity;
    yield this.decisionActivity?.decisionResultCode;
  }

  @task
  *loadSubmissions() {
    this.submissions = yield this.args.subcase?.submissions;
  }

  async deleteItem(agendaitem) {
    this.isVerifying = false;
    this.showLoader = true;
    const agendaItemType = await agendaitem.type;
    const previousNumber = agendaitem.number > 1 ? agendaitem.number - 1 : agendaitem.number;
    if (this.isDeletable) {
      await this.agendaService.deleteAgendaitem(agendaitem);
    } else {
      await this.agendaService.deleteAgendaitemFromMeeting(agendaitem);
    }

    if (this.args.onDeleteAgendaitem) {
      await this.args.onDeleteAgendaitem(agendaItemType, previousNumber);
    }
    this.showLoader = false;
  }

  @task
  *postponeAgendaitem() {
    yield this.setDecisionResultCode.perform(CONSTANTS.DECISION_RESULT_CODE_URIS.UITGESTELD);
    yield this.updateDecisionPiecePart.perform(this.intl.t('postponed-item-decision'));
    yield this.newsletterService.updateNewsItemVisibility(this.args.agendaitem);
  }

  @task
  *retractAgendaitem() {
    yield this.setDecisionResultCode.perform(CONSTANTS.DECISION_RESULT_CODE_URIS.INGETROKKEN);
    yield this.updateDecisionPiecePart.perform(this.intl.t('retracted-item-decision'));
    yield this.newsletterService.updateNewsItemVisibility(this.args.agendaitem);
  }

  @action
  toggleIsVerifying() {
    this.isVerifying = !this.isVerifying;
  }

  @action
  toggleIsVerifyingSendBack() {
    this.isVerifyingSendBack = !this.isVerifyingSendBack;
  }

  @action
  verifyDelete(agendaitem) {
    this.deleteItem(agendaitem);
  }

  @action
  async verifySendBackToSubmitter(agendaitem) {
    this.isSendingBackToSubmitter = true;
    const submission = this.submissions.at(0);
    await submission.updateStatus(
      CONSTANTS.SUBMISSION_STATUSES.TERUGGESTUURD,
      this.sendBackToSubmitterComment
    );
    await this.cabinetMail.sendBackToSubmitterMail(
      submission,
      this.sendBackToSubmitterComment
    );
    await this.deleteItem(agendaitem);
    const subcase = await submission.subcase;
    // If decisionmaking flow & case are new & they don't have other subcases
    //  → Delete
    if (submission.title) {
      const decisionmakingFlow = await submission.decisionmakingFlow;
      const subcases = await decisionmakingFlow.hasMany('subcases').reload();
      if (subcases.length === 1 && subcases.at(0).id === subcase.id) {
        const _case = await decisionmakingFlow.case;
        await _case.destroyRecord();
        await decisionmakingFlow.destroyRecord();
      }
    }
    // Delete subcase
    await subcase.destroyRecord();
    // Delete submission activity
    const submissionActivities = await submission.submissionActivities;
    await Promise.all((submissionActivities.map((activity) => activity.destroyRecord())));
    this.sendBackToSubmitterComment = '';
    this.isSendingBackToSubmitter = false;
  }

  @task
  *updateDecisionPiecePart(message) {
    const report = yield this.store.queryOne('report', {
      filter: {
        'decision-activity': { ':id:': this.decisionActivity.id },
      },
    });
    if (report) {
      const beslissingPiecePart = yield this.store.queryOne('piece-part', {
        filter: {
          report: { ':id:': report.id },
          ':has-no:next-piece-part': true,
          title: 'Beslissing',
        },
      });
      if (beslissingPiecePart) {
        const now = new Date();
        const newBeslissingPiecePart = yield this.store.createRecord(
          'piece-part',
          {
            title: 'Beslissing',
            htmlContent: message,
            report: report,
            previousPiecePart: beslissingPiecePart,
            created: now,
          }
        );
        yield newBeslissingPiecePart.save();
        yield this.decisionReportGeneration.generateReplacementReport.perform(
          report
        );
      }
    }
    return;
  }

  @task
  *resetDecisionResultCode() {
    const agendaItemType = yield this.args.agendaitem.type;
    const isAnnouncement =
      agendaItemType.uri === CONSTANTS.AGENDA_ITEM_TYPES.ANNOUNCEMENT;
    const defaultDecisionResultCodeUri = isAnnouncement
      ? CONSTANTS.DECISION_RESULT_CODE_URIS.KENNISNAME
      : CONSTANTS.DECISION_RESULT_CODE_URIS.GOEDGEKEURD;
    yield this.setDecisionResultCode.perform(defaultDecisionResultCodeUri);
  }

  @task
  *setDecisionResultCode(decisionResultCodeUri) {
    const decisionResultCodeConcept = yield this.store.findRecordByUri(
      'concept',
      decisionResultCodeUri
    );
    this.decisionActivity.decisionResultCode = decisionResultCodeConcept;
    yield this.decisionActivity.save();
    if (
      [
        CONSTANTS.DECISION_RESULT_CODE_URIS.UITGESTELD,
        CONSTANTS.DECISION_RESULT_CODE_URIS.INGETROKKEN,
      ].includes(decisionResultCodeUri)
    ) {
      const pieces = yield this.args.agendaitem.pieces;
      for (const piece of pieces.slice()) {
        yield this.pieceAccessLevelService.strengthenAccessLevelToInternRegering(
          piece
        );
        if (
          decisionResultCodeUri ===
          CONSTANTS.DECISION_RESULT_CODE_URIS.INGETROKKEN
        ) {
          yield this.signatureService.removeSignFlowForPiece(piece);
        }
      }
    }
  }
}
