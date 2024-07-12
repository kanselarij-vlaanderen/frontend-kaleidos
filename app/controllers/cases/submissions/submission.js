import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { TrackedArray } from 'tracked-built-ins';
import { task } from 'ember-concurrency';
import { removeObject } from 'frontend-kaleidos/utils/array-helpers';
import VRCabinetDocumentName from 'frontend-kaleidos/utils/vr-cabinet-document-name';
import { findDocType } from 'frontend-kaleidos/utils/document-type';

export default class CasesSubmissionsSubmissionController extends Controller {
  @service conceptStore;
  @service store;
  @service router;
  @service currentSession;
  @service fileConversionService;
  @service toaster;
  @service intl;

  @tracked isOpenPieceUploadModal = false;
  @tracked isOpenBatchDetailsModal = false;

  @tracked defaultAccessLevel;
  @tracked mandatees = new TrackedArray([]);
  @tracked pieces = new TrackedArray([]);
  @tracked highlightedPieces = new TrackedArray([]);
  @tracked newPieces = new TrackedArray([]);

  statusChangeActivities;
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

  get sortedNewPieces() {
    return this.newPieces.slice().sort((p1, p2) => {
      const d1 = p1.belongsTo('documentContainer').value();
      const d2 = p2.belongsTo('documentContainer').value();

      return d1?.position - d2?.position || p1.created - p2.created;
    });
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
    this.router.refresh();
    this.isOpenBatchDetailsModal = false;
  };

  @action
  async uploadPiece(file) {
    const name = file.filenameWithoutExtension;
    const parsed = new VRCabinetDocumentName(name).parsed;
    const type = await findDocType(this.conceptStore, parsed.type);

    const now = new Date();
    const confidential = this.model.confidential || false;
    const documentContainer = this.store.createRecord(
      'draft-document-container',
      {
        created: now,
        position: parsed.index,
        type,
      }
    );
    const piece = this.store.createRecord('draft-piece', {
      created: now,
      modified: now,
      file: file,
      confidential: confidential,
      accessLevel: this.defaultAccessLevel,
      name: parsed.subject,
      documentContainer: documentContainer,
      submission: this.model,
    });
    this.newPieces.push(piece);
    this.highlightedPieces.push(piece);
  }

  savePieces = task(async () => {
    // enforce all new pieces must have type on document container
    const typesPromises = this.newPieces.map(async (piece) => {
      const container = await piece.documentContainer;
      const type = await container.type;
      return type;
    });
    const types = await Promise.all(typesPromises);
    if (types.some((type) => !type)) {
      this.toaster.error(
        this.intl.t('document-type-required'),
        this.intl.t('warning-title')
      );
      return;
    }

    const savePromises = this.sortedNewPieces.map(async (piece, index) => {
      try {
        await this.savePiece.perform(piece, index);
      } catch (error) {
        await this.deletePiece.perform(piece);
        throw error;
      }
    });
    await Promise.all(savePromises);

    this.isOpenPieceUploadModal = false;
    this.newPieces = new TrackedArray([]);
    this.router.refresh();
  });

  savePiece = task(async (piece, index) => {
    const documentContainer = await piece.documentContainer;
    documentContainer.position = index + 1 + (this.pieces?.length ?? 0);
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
