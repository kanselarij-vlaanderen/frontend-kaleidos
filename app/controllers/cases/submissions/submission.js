import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { TrackedArray } from 'tracked-built-ins';
import { task } from 'ember-concurrency';
import { removeObject } from 'frontend-kaleidos/utils/array-helpers';
import VRCabinetDocumentName from 'frontend-kaleidos/utils/vr-cabinet-document-name';
import { findDocType } from 'frontend-kaleidos/utils/document-type';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class CasesSubmissionsSubmissionController extends Controller {
  @service conceptStore;
  @service store;
  @service router;
  @service currentSession;
  @service fileConversionService;
  @service toaster;
  @service intl;
  @service documentService;
  @service submissionService;

  @tracked isOpenPieceUploadModal = false;
  @tracked isOpenBatchDetailsModal = false;

  @tracked mandatees = new TrackedArray([]);
  @tracked pieces = new TrackedArray([]);
  @tracked documentContainerIds = new TrackedArray([]);
  @tracked newDraftPieces = new TrackedArray([]);
  @tracked newPieces = new TrackedArray([]);
  @tracked statusChangeActivities = new TrackedArray([]);
  @tracked approvalAddresses = new TrackedArray([]);
  @tracked notificationAddresses = new TrackedArray([]);
  @tracked approvalComment;
  @tracked notificationComment;

  currentLinkedMandatee;

  get mayEdit() {
    const mayIfAdmin = this.currentSession.may('always-edit-submissions');

    const mayIfSecretarie =
      this.currentSession.may('edit-in-treatment-submissions') &&
      this.model.isInTreatment;

    const mayIfKabinet =
      this.currentSession.may('edit-sent-back-submissions') &&
      this.model.isSentBack &&
      this.currentLinkedMandatee?.id ===
        this.model.belongsTo('requestedBy').value().id; // requestedBy is loaded in the route
    return mayIfAdmin || mayIfSecretarie || mayIfKabinet;
  }

  get isUpdate() {
    return this.model.belongsTo('subcase').value()?.id;
  }

  get sortedNewPieces() {
    return this.newPieces.slice().sort((p1, p2) => {
      const d1 = p1.belongsTo('documentContainer').value();
      const d2 = p2.belongsTo('documentContainer').value();

      return d1?.position - d2?.position || p1.created - p2.created;
    });
  }

  onNotificationDataChanged = async (newNotificationData) => {
    this.approvalAddresses = newNotificationData.approvalAddresses;
    this.approvalComment = newNotificationData.approvalComment;
    this.notificationAddresses = newNotificationData.notificationAddresses;
    this.notificationComment = newNotificationData.notificationComment;
  };

  onSaveNotificationData = async () => {
    this.model.approvalAddresses = this.approvalAddresses;
    this.model.approvalComment = this.approvalComment;
    this.model.notificationAddresses = this.notificationAddresses;
    this.model.notificationComment = this.notificationComment;
    await this.model.save();
  }

  disableMandatee = (mandatee) => {
    return this.currentLinkedMandatee.id === mandatee.id;
  };

  saveMandateeData = async ({ submitter, mandatees }) => {
    this.mandatees = mandatees;

    this.model.requestedBy = submitter;
    this.model.mandatees = this.mandatees;

    this.mandatees = this.mandatees
      .slice()
      .sort((m1, m2) => m1.priority - m2.priority);

    await this.model.save();
  };

  @action
  async saveGovernmentAreas(newGovernmentAreas) {
    this.model.governmentAreas = newGovernmentAreas;
    await this.model.save();
  }

  saveBatchDetails = () => {
    this.reloadPieces.perform();
    this.isOpenBatchDetailsModal = false;
  };

  onStatusUpdated = () => {
    this.reloadHistory.perform();
  }

  reloadHistory = task(async () => {
    const statusChangeActivities = await this.model.statusChangeActivities.reload();
    this.statusChangeActivities = statusChangeActivities
      .slice()
      .sort((a1, a2) => a1.startedAt.getTime() - a2.startedAt.getTime())
      .reverse();
    await Promise.all(this.statusChangeActivities.map((a) => a.status));
  });

  reloadPieces = task(async () => {
    const subcase = await this.model.subcase;
    const newPieces = await this.model.pieces;
    let pieces = [];
    if (subcase) {
      pieces = await this.submissionService.loadSubmissionPieces(subcase, newPieces);
    } else {
      pieces = newPieces.slice();
    }

    this.pieces = await sortPieces(pieces);

    let documentContainerIds = [];
    for (const piece of this.pieces) {
      const documentContainer = await piece.documentContainer;
      if (documentContainer && !documentContainerIds.includes(documentContainer.id)) {
        documentContainerIds.push(documentContainer.id);
      }
    }
    this.documentContainerIds = documentContainerIds;
    for (const newPiece of newPieces) {
      await newPiece.documentContainer;
    }
    const sortedNewPieces = newPieces?.slice().sort(
      (p1, p2) => p1.documentContainer.get('position') - p2.documentContainer.get('position')
    );
    this.newDraftPieces = sortedNewPieces;
  });

  updateDraftPiecePositions = async () => {
    await this.reloadPieces.perform();
    for (const piece of this.pieces) {
      if (piece.constructor.modelName === 'draft-piece') {
        let draftDocumentContainer = await piece.documentContainer;
        let currentPosition = this.documentContainerIds.indexOf(draftDocumentContainer.id) + 1;
        if (draftDocumentContainer.position !== currentPosition) {
          draftDocumentContainer.position = currentPosition;
          draftDocumentContainer.save();
        }
      }
    }
    await this.reloadPieces.perform();
  };

  @action
  async uploadPiece(file) {
    const name = file.filenameWithoutExtension;
    const parsed = new VRCabinetDocumentName(name).parsed;
    const type = await findDocType(this.conceptStore, parsed.type);

    const now = new Date();
    const confidential = this.model.confidential || false;
    const numberOfContainers = this.documentContainerIds.length;
    const documentContainer = this.store.createRecord(
      'draft-document-container',
      {
        created: now,
        position: parsed.index || (numberOfContainers + 1),
        type,
      }
    );
    const defaultAccessLevel = await this.store.findRecordByUri(
      'concept',
      (this.confidential || parsed.confidential)
        ? CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK
        : CONSTANTS.ACCESS_LEVELS.INTERN_REGERING
    );
    const piece = this.store.createRecord('draft-piece', {
      created: now,
      modified: now,
      file: file,
      confidential: confidential,
      accessLevel: defaultAccessLevel,
      name: parsed.subject,
      documentContainer: documentContainer,
      submission: this.model,
    });
    this.newPieces.push(piece);
    this.newDraftPieces.push(piece);
  }

  savePieces = task(async () => {
    const typesRequired = await this.documentService.enforceDocType(this.newPieces);
    if (typesRequired) return;

    const savePromises = this.sortedNewPieces.map(async (piece, index) => {
      try {
        await this.savePiece.perform(piece, index);
      } catch (error) {
        await this.deletePiece.perform(piece);
        throw error;
      }
    });
    await Promise.all(savePromises);
    await this.updateDraftPiecePositions();
    this.isOpenPieceUploadModal = false;
    this.newPieces = new TrackedArray([]);
  });

  savePiece = task(async (piece, index) => {
    const documentContainer = await piece.documentContainer;
    if (!documentContainer.position) {
      documentContainer.position = index + 1 + (this.documentContainerIds?.length ?? 0);
    }
    await documentContainer.save();
    piece.name = piece.name.trim();
    await piece.save();
    try {
      const sourceFile = await piece.file;
      await this.fileConversionService.convertSourceFile(sourceFile);
    } catch (error) {
      this.toaster.error(
        this.intl.t('error-convert-file', { message: error.message }),
        this.intl.t('warning-title')
      );
    }
  });

  cancelUploadPieces = task(async () => {
    const deletePromises = this.newPieces.map((piece) =>
      this.deletePiece(piece)
    );
    await Promise.all(deletePromises);
    this.newPieces = new TrackedArray([]);
    this.isOpenPieceUploadModal = false;
  });

  async deletePiece(piece) {
    const file = await piece.file;
    await file.destroyRecord();
    removeObject(this.newPieces, piece);
    const documentContainer = await piece.documentContainer;
    await documentContainer.destroyRecord();
    await piece.destroyRecord();
  }
}
