import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { reorderAgendaitemsOnAgenda } from 'frontend-kaleidos/utils/agendaitem-utils';
import { setNotYetFormallyOk } from 'frontend-kaleidos/utils/agendaitem-utils';
import { isPresent } from '@ember/utils';
import { A } from '@ember/array';
import { keepLatestTask, task } from 'ember-concurrency';
import { all, timeout } from 'ember-concurrency';
import {
  addPieceToAgendaitem,
  restorePiecesFromPreviousAgendaitem,
} from 'frontend-kaleidos/utils/documents';

export default class IndexAgendaitemAgendaitemsAgendaController extends Controller {
  @service store;
  @service currentSession;
  @service router;
  @service agendaitemAndSubcasePropertiesSync;
  @service toaster;
  @service intl;
  @service agendaService;
  @service fileConversionService;
  @service pieceAccessLevelService;
  @service signatureService;

  @controller('agenda.agendaitems') agendaitemsController;
  @controller('agenda') agendaController;
  @tracked meeting;
  @tracked agenda;
  @tracked agendaActivity;
  @tracked reverseSortedAgendas;
  @tracked subcase;
  @tracked submitter;
  @tracked newsItem;
  @tracked mandatees;
  @tracked decisionActivity;

  @tracked isEditingAgendaItemTitles = false;

  @tracked isComplete = false;
  @tracked vpModal = false;
  @tracked vpSent = false;

  documentsAreVisible;
  defaultAccessLevel;
  @tracked isOpenBatchDetailsModal = false;
  @tracked isOpenPieceUploadModal = false;
  @tracked isOpenPublicationModal = false;
  @tracked isOpenSignFlowModal = false;
  @tracked isOpenWarnDocEditOnApproved = false;
  @tracked hasConfirmedDocEditOnApproved = false;

  @tracked newPieces = A([]);
  @tracked newAgendaitemPieces;
  @tracked agendaitem;
  @tracked currentAgenda;
  @tracked previousAgenda;

  get isClosedMeeting() {
    return isPresent(this.meeting.agenda.get('id'));
  }

  async navigateToNeighbouringItem(agendaItemType, previousNumber) {
    // try transitioning to previous or next item, called on the delete of an agendaitem
    // TODO: below query can be replaced once agenda-items have relations to previous and next items
    const neighbouringItem = await this.store.queryOne('agendaitem', {
      'filter[agenda][:id:]': this.agenda.id,
      'filter[type][:id:]': agendaItemType.id,
      'filter[number]': previousNumber, // Needs quotes because of bug in mu-cl-resources
    });
    if (neighbouringItem) {
      this.router.transitionTo(
        'agenda.agendaitems.agendaitem',
        this.meeting.id,
        this.agenda.id,
        neighbouringItem.id,
        { queryParams: { anchor: neighbouringItem.id}}
      );
    } else {
      // If there is no neighbour, we most likely just deleted the last and only agendaitem
      // In this case we should transition to the agenda overview
      this.router.transitionTo(
        'agenda.agendaitems',
        this.meeting.id,
        this.agenda.id,
        { queryParams: { anchor: null } }
      );
    }
  }

  async reassignNumbersForAgendaitems() {
    await reorderAgendaitemsOnAgenda(this.agenda, this.currentSession.may('manage-agendaitems'));
  }

  @action
  async reassignNumbersAndNavigateToNeighbouringAgendaitem(agendaItemType, previousNumber) {
    await this.reassignNumbersForAgendaitems();
    await this.navigateToNeighbouringItem(agendaItemType, previousNumber);
    // reload the agenda route, detail tab should no longer show if we deleted the last and only agendaitem
    // Also, if we deleted the first agendaitem, we should also reload the main route to reload <Agenda::agendaTabs>
    return this.router.refresh('agenda');
  }

  @action
  async toggleIsEditingAgendaItemTitles() {
    this.isEditingAgendaItemTitles = !this.isEditingAgendaItemTitles;
  }

  @action
  async saveMandateeData(mandateeData) {
    const propertiesToSetOnAgendaitem = {
      mandatees: mandateeData.mandatees,
    };
    const propertiesToSetOnSubcase = {
      mandatees: mandateeData.mandatees,
      requestedBy: mandateeData.submitter,
    };
    this.mandatees = mandateeData.mandatees;
    this.submitter = mandateeData.submitter;
    await this.agendaitemAndSubcasePropertiesSync.saveChanges(
      this.model,
      propertiesToSetOnAgendaitem,
      propertiesToSetOnSubcase,
      true,
    );
    this.agendaitemsController.groupNotasOnGroupName.perform();
  }

  @action
  async saveGovernmentAreas(newGovernmentAreas) {
    const governmentAreas = await this.subcase.governmentAreas;
    governmentAreas.clear();
    governmentAreas.pushObjects(newGovernmentAreas);
    await this.subcase.save();
    setNotYetFormallyOk(this.model);
    await this.model.save();
  }

  @action
  showVpModal() {
    this.vpModal = !this.vpModal;
  }

  @action
  submitToVp() {
    this.vpModal = false;
    this.vpSent = true;
    this.toaster.success('Dossier is succesvol verstuurd naar het Vlaams Parlement');
  }

  get isShownOpenPublicationModal() {
    const mayPublish = this.currentSession.may('manage-publication-flows');
    const hasCase = isPresent(this.agendaActivity);
    const hasPieces = isPresent(this.model.pieces);
    return mayPublish && hasCase && hasPieces;
  }

  @task
  *loadNewPieces() {
    if (this.previousAgenda) {
      this.newAgendaitemPieces = yield this.agendaService.changedPieces(
        this.currentAgenda.id,
        this.previousAgenda.id,
        this.agendaitem.id
      );
    }
  }

  @action
  async openPieceUploadModal() {
    await this.ensureFreshData.perform();
    const canDocsBeEdited = await this.checkIfDocumentsCanBeEdited();
    if (canDocsBeEdited) {
      this.isOpenPieceUploadModal = true;
    }
  }

  @action
  async openUploadModalForNewPiece() {
    await this.ensureFreshData.perform();
    const canDocsBeEdited = await this.checkIfDocumentsCanBeEdited();
    if (canDocsBeEdited) {
      return true;
    }
    return false;
  }

  @action
  async checkIfDocumentsCanBeEdited() {
    const agendaStatus = await this.currentAgenda.belongsTo('status').reload();
    const isAgendaDraftOrLegacy = agendaStatus.isDesignAgenda || this.meeting.isPreKaleidos;
    if (!isAgendaDraftOrLegacy) {
      await this.currentAgenda.belongsTo('nextVersion').reload();
      await this.openWarnUploadOnApproved.perform();
    }
    return isAgendaDraftOrLegacy || this.hasConfirmedDocEditOnApproved;
  }

  @task
  *openWarnUploadOnApproved() {
    this.isOpenWarnDocEditOnApproved = true;
    this.hasConfirmedDocEditOnApproved = false;
    // The user has about 60 seconds to confirm
    for (let index = 0; index < 120; index++) {
      if (this.isOpenWarnDocEditOnApproved) {
        yield timeout(500);
      }
    }
    this.isOpenWarnDocEditOnApproved = false;
  }

  @action
  closeWarnDocEditOnApproved() {
    this.isOpenWarnDocEditOnApproved = false;
    this.hasConfirmedDocEditOnApproved = false;
  }

  @action
  confirmDocEditOnApproved() {
    this.isOpenWarnDocEditOnApproved = false;
    this.hasConfirmedDocEditOnApproved = true;
  }

  @action
  uploadPiece(file) {
    const now = new Date();
    const documentContainer = this.store.createRecord('document-container', {
      created: now,
    });
    const piece = this.store.createRecord('piece', {
      created: now,
      modified: now,
      file: file,
      accessLevel: this.defaultAccessLevel,
      name: file.filenameWithoutExtension,
      documentContainer: documentContainer,
    });
    this.newPieces.pushObject(piece);
  }

  @task
  *savePieces() {
    const savePromises = this.newPieces.map(async (piece) => {
      try {
        await this.savePiece.perform(piece);
      } catch (error) {
        await this.deletePiece.perform(piece);
        throw error;
      }
    });
    yield all(savePromises);
    yield this.updateRelatedAgendaitemsAndSubcase.perform(this.newPieces);
    this.isOpenPieceUploadModal = false;
    this.newPieces = A();
  }

  /**
   * Save a new document container and the piece it wraps
   */
  @task
  *savePiece(piece) {
    const documentContainer = yield piece.documentContainer;
    yield documentContainer.save();
    piece.name = piece.name.trim();
    yield piece.save();
    try {
      const sourceFile = yield piece.file;
      yield this.fileConversionService.convertSourceFile(sourceFile);
    } catch (error) {
      this.toaster.error(
        this.intl.t('error-convert-file', { message: error.message }),
        this.intl.t('warning-title'),
      );
    }
  }

  /**
   * Add new piece to an existing document container
   */
  @task
  *addPiece(piece, signFlow) {
    const shouldReplaceSignFlow = !!signFlow;
    if (shouldReplaceSignFlow) {
      yield this.signatureService.removeSignFlow(signFlow);
    }
    yield piece.save();
    if (shouldReplaceSignFlow) {
      yield this.signatureService.markDocumentForSignature(piece, this.decisionActivity);
    }
    yield this.pieceAccessLevelService.updatePreviousAccessLevel(piece);
    try {
      const sourceFile = yield piece.file;
      yield this.fileConversionService.convertSourceFile(sourceFile);
    } catch (error) {
      this.toaster.error(
        this.intl.t('error-convert-file', { message: error.message }),
        this.intl.t('warning-title'),
      );
    }
    yield this.updateRelatedAgendaitemsAndSubcase.perform([piece]);
  }

  @task
  *cancelUploadPieces() {
    const deletePromises = this.newPieces.map((piece) =>
      this.deletePiece.perform(piece)
    );
    yield all(deletePromises);
    this.newPieces = A();
    this.isOpenPieceUploadModal = false;
  }

  @task
  *cancelAddPiece(piece) {
    const file = yield piece.file;
    yield file.destroyRecord();
    yield piece.destroyRecord();
  }

  @task
  *deletePiece(piece) {
    const file = yield piece.file;
    yield file.destroyRecord();
    this.newPieces.removeObject(piece);
    const documentContainer = yield piece.documentContainer;
    yield documentContainer.destroyRecord();
    yield piece.destroyRecord();
  }

  @keepLatestTask
  *ensureFreshData() {
    yield this.agendaitem.preEditOrSaveCheck();
  }

  @action
  async setPreviousPiecesFromAgendaitem(previousPiece) {
    const documentContainer = await previousPiece?.documentContainer;
    if (documentContainer) {
      const pieces = documentContainer.pieces;
      if (this.agendaitem && pieces.length > 0) {
        await restorePiecesFromPreviousAgendaitem(this.agendaitem, documentContainer);
        // TODO: make sure we're not loading stale cache
      }
    }
  }

  @task
  *updateRelatedAgendaitemsAndSubcase(pieces) {
    yield this.ensureFreshData.perform(); // some other user could have saved agendaitem before we pressed save
    if (!this.hasConfirmedDocEditOnApproved) {
      const canDocsBeEdited = yield this.checkIfDocumentsCanBeEdited();
      if (!canDocsBeEdited) {
        // delete without a warning, upload not allowed or confirmed
        if (this.newPieces.length) {
          yield this.cancelUploadPieces.perform();
        } else {
          const deletePromises = pieces.map(async (piece) => {
            await this.cancelAddPiece.perform(piece);
          });
          yield all(deletePromises);
        }
        return;
      }
    }

    // Failsafe, if we got to a situation where the user has old pieces data when saving new pieces, we refresh the relation to avoid stale data
    // The improved concurrency check should be enough, but as long as we save here, the risk of saving old data exists
    yield this.agendaitem.hasMany('pieces').reload();
    // Link pieces to subcase with activity
    const agendaActivity = yield this.agendaitem.agendaActivity;
    if (agendaActivity) {
      // There is no agendaActivity/subcase on isApproval agendaitems
      const subcase = yield agendaActivity.subcase;
      // Create new submission activity for pieces added after initial submission
      const submissionActivity = this.store.createRecord(
        'submission-activity',
        {
          startDate: new Date(),
          subcase,
          agendaActivity,
          pieces,
        }
      );
      submissionActivity.save(); // submission-act isn't needed further here. No yield. Can run in background.
    }

    // save formal ok change on agendaitem
    // If the concurrency check failed you can overwrite the pieces list with stale data, effectively losing piece links to agendaitem
    setNotYetFormallyOk(this.agendaitem);
    yield this.agendaitem.save();

    // Link piece to agendaitem
    for (const piece of pieces) {
      yield addPieceToAgendaitem(this.agendaitem, piece);
    }
    // ensure the cache does not hold stale data + refresh our local store for future saves of agendaitem
    for (let index = 0; index < 10; index++) {
      const agendaitemPieces = yield this.agendaitem.hasMany('pieces').reload();
      if (agendaitemPieces.includes(pieces[pieces.length - 1])) {
        // last added piece was found in the list from cache
        this.router.refresh('agenda.agendaitems.agendaitem.documents');
        break;
      } else {
        // list from cache is stale, wait with back-off strategy
        yield timeout(500 + index * 500);
        if (index >= 9) {
          this.toaster.error(
            this.intl.t('documents-may-not-be-saved-message'),
            this.intl.t('warning-title'),
            {
              timeOut: 60000,
            }
          );
        }
      }
    }
  }

  @action
  async openBatchDetails() {
    await this.ensureFreshData.perform();
    this.isOpenBatchDetailsModal = true;
  }

  @action
  cancelBatchDetails() {
    this.isOpenBatchDetailsModal = false;
  }

  @action
  saveBatchDetails() {
    this.isOpenBatchDetailsModal = false;
    this.router.refresh('agenda.agendaitems.agendaitem.documents');
  }

  @action
  openPublicationModal() {
    this.isOpenPublicationModal = true;
  }

  @action
  closePublicationModal() {
    this.isOpenPublicationModal = false;
  }

  @action
  refresh() {
    this.router.refresh('agenda.agendaitems.agendaitem.documents');
  }
}

