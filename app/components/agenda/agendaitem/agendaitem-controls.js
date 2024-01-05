import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { isPresent } from '@ember/utils';
import ENV from 'frontend-kaleidos/config/environment';

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

  @tracked isVerifying = false;
  @tracked showLoader = false;
  @tracked isDesignAgenda;
  @tracked decisionActivity;
  @tracked showVPModal = false;
  @tracked hasDecreet = false;
  @tracked subcase;
  @tracked canSendToVP = false;

  constructor() {
    super(...arguments);

    this.loadAgendaData.perform();
    this.loadDecisionActivity.perform()
  }

  loadCanSendToVP = task(async () => {
    if (!this.enableVlaamsParlement || !this.subcase) {
      this.canSendToVP = false;
      return;
    }

    // /is-ready-for-vp covers this, but we might be in a postponed
    // and resubmitted subcase, in which case the whole flow is still
    // ready but the current agenda item isn't
    const decisionResultCode = await this.decisionActivity?.decisionResultCode;
    if (decisionResultCode?.uri !== CONSTANTS.DECISION_RESULT_CODE_URIS.GOEDGEKEURD) {
      this.canSendToVP = false;
      return;
    }

    const fetchIsReadyForVp = async () => {
      const decisionmakingFlow = await this.subcase.decisionmakingFlow;
      const resp = await fetch(
        `/vlaams-parlement-sync/is-ready-for-vp/?uri=${decisionmakingFlow.uri}`,
        { headers: { Accept: 'application/vnd.api+json' } }
      );
      if (!resp.ok) {
        return false;
      } else {
        const body = await resp.json();
        return body.isReady;
      }
    };

    if (this.currentSession.may('send-only-specific-cases-to-vp')) {
      const submitter = await this.subcase.requestedBy;
      const currentUserOrganization = await this.currentSession.organization;
      const currentUserOrganizationMandatees = await currentUserOrganization.mandatees;
      const currentUserOrganizationMandateesUris = currentUserOrganizationMandatees.map((mandatee) => mandatee.uri);
      if (currentUserOrganizationMandateesUris.includes(submitter?.uri)) {
        this.canSendToVP = await fetchIsReadyForVp();
      } else {
        this.canSendToVP = false;
      }
    } else if (this.currentSession.may('send-cases-to-vp')) {
      this.canSendToVP = await fetchIsReadyForVp();
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

  get enableVlaamsParlement() {
    return (
      ENV.APP.ENABLE_VLAAMS_PARLEMENT === 'true' ||
      ENV.APP.ENABLE_VLAAMS_PARLEMENT === true
    );
  }

  @action
  async onSendToVp() {
    // This is a hack to solve the issue where services
    // send a response before the cache is updated.
    const MAX_RETRIES = 10;
    const case_ = await this.store.queryOne('case', {
      'filter[decisionmaking-flow][subcases][:id:]': this.subcase.id,
    });
    let parliamentFlow = null;
    for (let i = 0; i < MAX_RETRIES && !parliamentFlow; i++) {
      parliamentFlow = await case_.parliamentFlow.reload();
      if (parliamentFlow) {
        const subcase = await parliamentFlow?.parliamentSubcase.reload();
        await subcase?.parliamentSubmissionActivities.reload();
        await parliamentFlow.status.reload();
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    this.showVPModal = false;
    if (this.args.onSendToVp) {
      this.args.onSendToVp();
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

  get deleteWarningText() {
    if (this.isDeletable) {
      return this.intl.t('delete-agendaitem-message');
    }
    if (this.currentSession.isAdmin) {
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
    let decreetDocument;
    if (this.decisionActivity) {
      yield this.decisionActivity.decisionResultCode;
      this.subcase = yield this.decisionActivity.subcase;
      decreetDocument = yield this.store.queryOne('piece', {
        'filter[document-container][type][:uri:]':
          CONSTANTS.DOCUMENT_TYPES.DECREET,
        'filter[agendaitems][:id:]': this.args.agendaitem.id,
      });
    }
    this.hasDecreet = isPresent(decreetDocument);
    this.loadCanSendToVP.perform();
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
  }

  @task
  *retractAgendaitem() {
    yield this.setDecisionResultCode.perform(CONSTANTS.DECISION_RESULT_CODE_URIS.INGETROKKEN);
    yield this.updateDecisionPiecePart.perform(this.intl.t('retracted-item-decision'));
  }

  @action
  toggleIsVerifying() {
    this.isVerifying = !this.isVerifying;
  }

  @action
  verifyDelete(agendaitem) {
    this.deleteItem(agendaitem);
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
      for (const piece of pieces.toArray()) {
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
