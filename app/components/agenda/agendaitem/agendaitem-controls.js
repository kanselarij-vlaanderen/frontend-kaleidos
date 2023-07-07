import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

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

  @tracked isVerifying = false;
  @tracked showLoader = false;
  @tracked isDesignAgenda;
  @tracked decisionActivity;

  constructor() {
    super(...arguments);

    this.loadAgendaData.perform();
    this.loadDecisionActivity.perform();
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
    yield this.decisionActivity?.decisionResultCode;
  }

  async deleteItem(agendaitem) {
    this.isVerifying = false;
    this.showLoader = true;
    const agendaItemType = await agendaitem.type;
    const previousNumber = agendaitem.number > 1 ? agendaitem.number - 1 : agendaitem.number;
    if (await this.isDeletable) {
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
  }


  @task
  *retractAgendaitem() {
    yield this.setDecisionResultCode.perform(CONSTANTS.DECISION_RESULT_CODE_URIS.INGETROKKEN);
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
    if ([CONSTANTS.DECISION_RESULT_CODE_URIS.UITGESTELD, CONSTANTS.DECISION_RESULT_CODE_URIS.INGETROKKEN].includes(decisionResultCodeUri)) {
      const pieces = yield this.args.agendaitem.pieces;
      for (const piece of pieces.slice()) {
        yield this.pieceAccessLevelService.strengthenAccessLevelToInternRegering(piece);
      }
    }
  }
}
