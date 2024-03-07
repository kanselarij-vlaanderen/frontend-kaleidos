import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { all } from 'rsvp'; // TODO KAS-2399 better way then this ?
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
import {
  approveAgendaAndCloseMeeting,
  approveDesignAgenda,
  closeMeeting,
  deleteAgenda,
  reopenMeeting,
  reopenPreviousAgenda,
} from 'frontend-kaleidos/utils/agenda-approval';
import bind from 'frontend-kaleidos/utils/bind';
import { deletePiece } from 'frontend-kaleidos/utils/document-delete-helpers';
import { isPresent } from '@ember/utils';

/**
 * A component that contains most of the meeting/agenda actions that interact with a backend service.
 * This contains all actions of the left button in the right toolbar of Agenda::AgendaHeader component
 *
 * @argument meeting: the viewed meeting
 * @argument currentAgenda: the selected agenda
 * @argument reverseSortedAgendas: the agendas of the meeting, reverse sorted on serial number
 * @argument didCloseMeeting: action to take after closing a meeting
 * @argument onStartLoading
 * @argument onStopLoading
 */
export default class AgendaAgendaHeaderAgendaVersionActions extends Component {
  @service store;
  @service currentSession;
  @service agendaService;
  @service router;
  @service intl;
  @service toaster;

  @tracked showLoadingOverlay = false;
  @tracked loadingMessage = false;
  @tracked showConfirmForApprovingAgenda = false;
  @tracked showConfirmForApprovingAgendaAndClosingMeeting = false;
  @tracked showConfirmForClosingMeeting = false;
  @tracked showConfirmForDeletingSelectedAgenda = false;
  @tracked showConfirmForReopeningPreviousAgenda = false;
  @tracked piecesToDeleteReopenPreviousAgenda = null;

  @tracked isDesignAgenda = false;
  @tracked designAgenda = null;
  @tracked lastApprovedAgenda = null;

  constructor() {
    super(...arguments);

    this.loadAgendaData.perform();
  }

  @task
  *loadAgendaData() {
    const status = yield this.args.currentAgenda.status;
    this.isDesignAgenda = status.isDesignAgenda;

    for (const agenda of this.args.reverseSortedAgendas.slice()) {
      const status = yield agenda.status;
      if (status.isDesignAgenda) {
        this.designAgenda = agenda;
        break;
      }
    }

    for (const agenda of this.args.reverseSortedAgendas.slice()) {
      const status = yield agenda.status;
      if (!status.isDesignAgenda) {
        this.lastApprovedAgenda = agenda;
        break;
      }
    }
  }

  get isFinalMeeting() {
    return isPresent(this.args.meeting.agenda.get('id'));
  }

  get latestAgenda() {
    return this.args.reverseSortedAgendas.firstObject;
  }

  get isMeetingClosable() {
    // The session is closable when there are more than 1 agendas OR when there is only 1 agenda that is not a design agenda
    const agendas = this.args.reverseSortedAgendas;
    if (agendas.length > 1 || this.lastApprovedAgenda) {
      return true;
    }
    return false;
  }

  get currentAgendaIsLatest() {
    return (
      this.latestAgenda.id === this.args.currentAgenda.id
    );
  }

  /**
   * - the meeting must not be final
   * - the meeting to have at least one approved agenda (isMeetingClosable)
   * - the user must be admin
   * - the current selected agenda must be the last one
   * - the current selected agenda should be design agenda
   * TODO check if kanselarij should be able to use this
   * TODO check if we want to be able to reopen an approved agenda without a design agenda present
   * @returns boolean
   */
  get canReopenPreviousAgenda() {
    return (
      !this.isFinalMeeting &&
      this.isMeetingClosable &&
      (this.currentSession.may('reopen-approved-agenda-version')) &&
      this.currentAgendaIsLatest &&
      this.isDesignAgenda
    )
  }

  /**
   * - if the currentAgenda is design agenda, both editor and admin can delete
   * - if the currentAgenda is approved, only admin can delete the agenda if it's the latest one
   * @returns boolean
   */
  get canDeleteSelectedAgenda() {
    return (
      this.isDesignAgenda ||
      ((this.currentSession.may('remove-approved-agenda')) && this.currentAgendaIsLatest)
    );
  }

  @bind
  async canBeApproved() {
    const agendaitems = await this.args.currentAgenda.agendaitems;
    const approvedAgendaitems = agendaitems.filter((agendaitem) => [CONSTANTS.ACCEPTANCE_STATUSSES.OK].includes(agendaitem.formallyOk));
    return approvedAgendaitems.length === agendaitems.length;
  }

  async allAgendaitemsNotOk() {
    const agendaitems = await this.args.currentAgenda.agendaitems;
    return agendaitems
      .filter((agendaitem) => [CONSTANTS.ACCEPTANCE_STATUSSES.NOT_OK, CONSTANTS.ACCEPTANCE_STATUSSES.NOT_YET_OK].includes(agendaitem.formallyOk))
      .sort((a1, a2) => a1.number - a2.number);
  }

  @bind
  async newAgendaitemsNotOk() {
    const allAgendaitemsNotOk = await this.allAgendaitemsNotOk();

    const newAgendaitems = A([]);
    for (const agendaitem of allAgendaitemsNotOk) {
      const previousVersion = await agendaitem.previousVersion;
      if (!previousVersion) {
        newAgendaitems.push(agendaitem);
      }
    }
    return newAgendaitems;
  }

  @bind
  async approvedAgendaitemsNotOk() {
    const allAgendaitemsNotOk = await this.allAgendaitemsNotOk();

    const approvedAgendaitems = A([]);
    for (const agendaitem of allAgendaitemsNotOk) {
      const previousVersion = await agendaitem.previousVersion;
      if (previousVersion) {
        approvedAgendaitems.push(agendaitem);
      }
    }
    return approvedAgendaitems;
  }

  /**
   * This task will reload the agendaitems of the current agenda
   * Any new agendaitem or changed formality is picked up by this, to avoid stale data created by concurrent edits of agendaitem
   */
  @task
  *reloadAgendaitemsData() {
    /**
     * This hasMany reload will:
     * - Refresh the amount of agendaitems there are (if new were added)
     * - Reload the agendaitems attributes (titles, formal ok status (uri), etc)
     * - Reload the agendaitems concurrency (modified attribute)
     */
    yield this.args.currentAgenda.hasMany('agendaitems').reload();
    // When reloading the data for this use-case, only the agendaitems that are not "formally ok" have to be fully reloaded
    // If not reloaded, any following PATCH call on these agendaitems will succeed (due to the hasMany reload above) but with old relation data
    // *NOTE* since we only load the "nok/not yet ok" items, it is still possible to save old relations on formally ok items (although most changes should reset the formality)
    const agendaitemsNotOk = yield this.allAgendaitemsNotOk();
    for (const agendaitem of agendaitemsNotOk) {
      // Reloading some relationships of agendaitem most likely to be changed by concurrency
      yield agendaitem.reload();
      yield agendaitem.hasMany('pieces').reload();
      yield agendaitem.hasMany('mandatees').reload();
      yield agendaitem.hasMany('linkedPieces').reload();
    }
  }

  /**
   * This task will get all pieces that are new on the current designAgenda
   * Excluding the pieces from new agendaitems, they don't have to be deleted
   * Used in reopenPreviousAgenda action
   */
  @task
  *loadPiecesToDelete() {
    const agendaitems = yield this.args.currentAgenda.agendaitems;
    const previousAgenda = yield this.args.currentAgenda.previousVersion;
    const pieces = [];
    const agendaitemNewPieces = agendaitems.map(async (agendaitem) => {
      const previousVersion = await agendaitem.previousVersion;
      if (previousVersion) {
        const newPieces = await this.agendaService.changedPieces(
          this.args.currentAgenda.id,
          previousAgenda.id,
          agendaitem.id
        );
        if (newPieces.length > 0) {
          pieces.push(...newPieces);
        }
      }
    });
    yield all(agendaitemNewPieces);
    this.piecesToDeleteReopenPreviousAgenda = sortPieces(pieces);
  }

  // TODO KAS-2399 could we get rid of this when we reload the model with agendaitems includes?
  /**
   * After a new designagenda is created or an agenda deleted in the service we need to update the agenda activities
   * The store only updates the agendaitems of agenda-activities if we do it outselves
   */
  @action
  async reloadAgendaitemsOfAgenda(agenda) {
    const agendaitems = await agenda.hasMany('agendaitems').reload();
    await agendaitems.map(async (agendaitem) => {
      const agendaActivity = await agendaitem.agendaActivity;
      if (agendaActivity) {
        await agendaActivity.hasMany('agendaitems').reload();
      }
    });
  }

  /**
   * Calls the agenda-approve-service to create a new design agenda:
   * Gets the last approved agenda and changes the status to approved (from final)
   * Also reopens the meeting if needed (for action unlockAgenda)
   * The agenda gets copied including the agendatems and a new design agenda id is returned
   * We then reload some models/relations and route to the new agenda
   */
  @action
  async reopenMeeting() {
    this.args.onStartLoading(this.intl.t('agenda-add-message'));
    try {
      const newAgendaId = await reopenMeeting(this.args.meeting);
      const newAgenda = await this.store.findRecord('agenda', newAgendaId);
      // After the agenda has been created, we want to update the agendaitems of activities
      await this.reloadAgendaitemsOfAgenda(newAgenda);
      await this.reloadMeeting();
      this.args.onStopLoading();
      this.router.transitionTo(
        'agenda.agendaitems',
        this.args.meeting.id,
        newAgenda.id
      );
    } catch (error) {
      // We use this method for 2 actions so we want to show different messages on failure
      if (this.isFinalMeeting === true) {
        this.toaster.error(
          this.intl.t('error-reopen-meeting', { message: error.message }),
          this.intl.t('warning-title')
        );
      } else {
        this.toaster.error(
          this.intl.t('error-create-design-agenda', { message: error.message }),
          this.intl.t('warning-title')
        );
      }
      this.args.onStopLoading();
    }
  }

  @action
  async openConfirmApproveAgenda() {
    this.reloadAgendaitemsData.perform();
    this.showConfirmForApprovingAgenda = true;
  }

  @action
  cancelApproveAgenda() {
    this.showConfirmForApprovingAgenda = false;
  }

  /**
   * This method is going to send the current design agenda to the agenda service for approval
   * - For new items that were formally not ok, they have to be removed from the approved agenda and the agendaitems on that agenda have to be resorted (do this in service ?)
   * - For items that have been on previous approved agendas (and not formally ok now), we have to move the changes made to the new agenda
   * This means rolling back the agendaitem version on the recently approved agenda to match what was approved in the past
   * Basically we want all info and relationships from the old version, while keeping our id, link to agenda, link to previous and next agendaitems
   * This should best be done in the approve service, because we want all triples copied.
   * Since the changes happen in a mirco-service, we have to update our local store by reloading
   *
   */
  @action
  async approveCurrentAgenda() {
    this.showConfirmForApprovingAgenda = false;
    this.args.onStartLoading(this.intl.t('agenda-approving-text'));
    if (!this.isDesignAgenda) {
      this.showNotAllowedToast();
      return;
    }
    try {
      const newAgendaId = await approveDesignAgenda(this.args.currentAgenda);
      const newAgenda = await this.store.findRecord('agenda', newAgendaId);
      // Data reloading
      await this.reloadAgenda(this.args.currentAgenda);
      await this.reloadAgendaitemsOfAgenda(this.args.currentAgenda);
      await this.reloadMeeting();
      this.args.onStopLoading();
      return this.router.transitionTo(
        'agenda.agendaitems',
        this.args.meeting.id,
        newAgenda.id
      );
    } catch (error) {
      this.toaster.error(
        this.intl.t('error-approve-agenda', { message: error.message }),
        this.intl.t('warning-title')
      );
      this.args.onStopLoading();
    }
  }

  @action
  async openConfirmApproveAgendaAndCloseMeeting() {
    this.reloadAgendaitemsData.perform();
    this.showConfirmForApprovingAgendaAndClosingMeeting = true;
  }

  @action
  cancelApproveAgendaAndCloseMeeting() {
    this.showConfirmForApprovingAgendaAndClosingMeeting = false;
  }

  /**
   * This method is going to change the status of the current design agenda to closed
   * - For new items that were formally not ok, they have to be removed from the approved agenda and the agendaitems have to be resorted
   * - For items that have been on previous approved agendas (and not formally ok now), we have to rollback the agendaitems to a previous version
   * This means rolling back the agendaitem version on the recently approved agenda to match what was approved in the past
   * Basically we want all info and relationships from the old version, while keeping our id, link to agenda, link to previous and next agendaitems
   * We also set the meeting to closed and set the final agenda
   */
  @action
  async approveCurrentAgendaAndCloseMeeting() {
    this.showConfirmForApprovingAgendaAndClosingMeeting = false;
    this.args.onStartLoading(
      this.intl.t('agenda-approve-and-close-message')
    );
    if (!this.isDesignAgenda) {
      this.showNotAllowedToast();
      return;
    }
    try {
      await approveAgendaAndCloseMeeting(this.args.currentAgenda);
      await timeout(1000); // timeout to await async cache invalidations in backend to be finished
      // Data reloading
      await this.reloadAgenda(this.args.currentAgenda);
      await this.reloadAgendaitemsOfAgenda(this.args.currentAgenda);
      await this.reloadMeeting();
    } catch (error) {
      this.toaster.error(
        this.intl.t('error-approve-close-agenda', { message: error.message }),
        this.intl.t('warning-title')
      );
    } finally {
      this.args.onStopLoading();
      this.args.didCloseMeeting();
    }
  }

  @action
  openConfirmCloseMeeting() {
    this.showConfirmForClosingMeeting = true;
  }

  @action
  cancelCloseMeeting() {
    this.showConfirmForClosingMeeting = false;
  }

  /**
   * This method will delete the current design agenda (if applicable) and close the meeting
   */
  @action
  async closeMeeting() {
    this.showConfirmForClosingMeeting = false;
    this.args.onStartLoading(this.intl.t('agenda-close-message'));
    if (!this.isMeetingClosable) {
      this.showNotAllowedToast();
      return;
    }
    try {
      const lastApprovedAgendaId = await closeMeeting(this.args.meeting);
      await timeout(1000); // timeout to await async cache invalidations in backend to be finished
      const lastApprovedAgenda = await this.store.findRecord('agenda', lastApprovedAgendaId);
      // Data reloading
      await this.reloadAgenda(lastApprovedAgenda);
      await this.reloadAgendaitemsOfAgenda(lastApprovedAgenda);
      await this.reloadMeeting();
      this.args.onStopLoading();
      if (this.isDesignAgenda) {
        return this.router.transitionTo(
          'agenda.agendaitems',
          this.args.meeting.id,
          lastApprovedAgenda.id,
        );
      }
      this.args.didCloseMeeting();
    } catch (error) {
      this.toaster.error(
        this.intl.t('error-close-meeting', { message: error.message }),
        this.intl.t('warning-title')
      );
      this.args.onStopLoading();
    }
  }

  @action
  openConfirmDeleteSelectedAgenda() {
    this.showConfirmForDeletingSelectedAgenda = true;
  }

  @action
  cancelDeleteSelectedAgenda() {
    this.showConfirmForDeletingSelectedAgenda = false;
  }

  /**
   * This method will delete the current agenda only if it's the last agenda of the meeting, regardless of status
   * If this is the only agenda in the meeting, also delete the meeting (broken state if there is a meeting with 0 agendas)
   */
  @action
  async deleteSelectedAgenda() {
    this.showConfirmForDeletingSelectedAgenda = false;
    this.args.onStartLoading(this.intl.t('agenda-delete-message'));
    if (!this.canDeleteSelectedAgenda) {
      this.showNotAllowedToast();
      return;
    }
    try {
      const lastApprovedAgendaId = await deleteAgenda(this.args.currentAgenda);
      if (lastApprovedAgendaId) {
        const lastApprovedAgenda = await this.store.findRecord('agenda', lastApprovedAgendaId);
        // Data reloading
        await this.reloadAgendaitemsOfAgenda(lastApprovedAgenda);
        await this.reloadMeeting();
        this.args.onStopLoading();
        return this.router.transitionTo(
          'agenda.agendaitems',
          this.args.meeting.id,
          lastApprovedAgenda.id,
        );
      }
      // if there is no previous agenda, the meeting should have been deleted
      this.router.transitionTo('agendas');
      // this.args.onStopLoading does not work here because the view attempts to reload Agendaitem Nav linkTo with deleted models before transitioning
    } catch (error) {
      this.args.onStopLoading();
      this.toaster.error(
        this.intl.t('error-delete-agenda', { message: error.message }),
        this.intl.t('warning-title')
      );
    }
  }

  @action
  openConfirmReopenPreviousAgenda() {
    this.loadPiecesToDelete.perform();
    this.showConfirmForReopeningPreviousAgenda = true;
  }

  @action
  cancelReopenPreviousAgenda() {
    this.piecesToDeleteReopenPreviousAgenda = null;
    this.showConfirmForReopeningPreviousAgenda = false;
  }

  /**
   * This method will delete the design agenda (if applicable) and change the last approved agenda status to design agenda.
   */
  @action
  async reopenPreviousAgenda() {
    this.showConfirmForReopeningPreviousAgenda = false;
    this.args.onStartLoading(
      this.intl.t('agenda-reopen-previous-version-message')
    );
    if (!this.canReopenPreviousAgenda) {
      this.showNotAllowedToast();
      return;
    }
    try {
      // delete all the new documents from the designagenda
      if (this.piecesToDeleteReopenPreviousAgenda) {
        await all(
          this.piecesToDeleteReopenPreviousAgenda.map(async (piece) => {
            await deletePiece(piece);
          })
        );
        this.piecesToDeleteReopenPreviousAgenda = null;
      }
      const lastApprovedAgendaId = await reopenPreviousAgenda(this.args.currentAgenda);
      const lastApprovedAgenda = await this.store.findRecord('agenda', lastApprovedAgendaId);
      // Data reloading
      await this.reloadAgenda(lastApprovedAgenda);
      await this.reloadAgendaitemsOfAgenda(lastApprovedAgenda);
      await this.reloadMeeting();
      this.args.onStopLoading();
      return this.router.transitionTo(
        'agenda.agendaitems',
        this.args.meeting.id,
        lastApprovedAgenda.id
      );
    } catch (error) {
      this.toaster.error(
        this.intl.t('error-reopen-previous-agenda', { message: error.message }),
        this.intl.t('warning-title')
      );
      this.args.onStopLoading();
    }
  }

  @action
  showPieceViewer(piece) {
    window.open(`/document/${piece.id}`);
  }

  @action
  async reloadMeeting() {
    // This is a workaround for route not reloading attributes and agendas on refresh model
    await this.args.meeting.reload();
    await this.args.meeting.hasMany('agendas').reload();
    await this.args.meeting.belongsTo('agenda').reload();
  }

  @action
  async reloadAgenda(agenda) {
    // This is a workaround for route not reloading attributes and status on refresh model
    await agenda.reload();
    await agenda.belongsTo('status').reload();
  }

  @action
  showNotAllowedToast() {
    this.toaster.error(
      this.intl.t('action-not-allowed'),
      this.intl.t('warning-title')
    );
  }
}
