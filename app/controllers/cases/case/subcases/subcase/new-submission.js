import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { TrackedArray } from 'tracked-built-ins';
import { task, all } from 'ember-concurrency';
import { addObject, removeObject } from 'frontend-kaleidos/utils/array-helpers';
import VRCabinetDocumentName from 'frontend-kaleidos/utils/vr-cabinet-document-name';
import { findDocType } from 'frontend-kaleidos/utils/document-type';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { trimText } from 'frontend-kaleidos/utils/trim-util';

export default class CasesCaseSubcasesSubcaseNewSubmissionController extends Controller {
  @service conceptStore;
  @service intl;
  @service router;
  @service store;
  @service toaster;
  @service fileConversionService;

  defaultAccessLevel;

  @tracked isOpenPieceUploadModal = false;
  @tracked isOpenCreateSubmissionModal = false;

  @tracked comment;
  @tracked approvalComment;
  @tracked notificationComment;
  @tracked pieces = new TrackedArray([]);
  @tracked newPieces = new TrackedArray([]);
  @tracked highlightedPieces = new TrackedArray([]);

  get sortedNewPieces() {
    return this.newPieces.slice().sort((p1, p2) => {
      const d1 = p1.belongsTo('documentContainer').value();
      const d2 = p2.belongsTo('documentContainer').value();

      return d1.position - d2.position || p1.created - p2.created;
    });
  }

  onAddNewPieceVersion = async (piece, newVersion) => {
    const documentContainer = await newVersion.documentContainer;
    await documentContainer.save();
    await newVersion.save();
    const index = this.pieces.indexOf(piece);
    this.pieces[index] = newVersion;
    this.pieces = [...this.pieces];
    addObject(this.highlightedPieces, newVersion);
  };

  uploadPiece = async (file) => {
    const name = file.filenameWithoutExtension;
    const parsed = new VRCabinetDocumentName(name).parsed;
    const type = await findDocType(this.conceptStore, parsed.type);

    const now = new Date();
    const documentContainer = this.store.createRecord('draft-document-container', {
      created: now,
      position: parsed.index,
      type,
    });
    const piece = this.store.createRecord('draft-piece', {
      created: now,
      modified: now,
      file: file,
      accessLevel: this.defaultAccessLevel,
      name: parsed.subject,
      documentContainer: documentContainer,
    });
    this.newPieces.push(piece);
  }

  deletePiece = async (piece) => {
    const file = await piece.file;
    await file.destroyRecord();
    removeObject(this.newPieces, piece);
    const documentContainer = await piece.documentContainer;
    await documentContainer.destroyRecord();
    await piece.destroyRecord();
  }

  savePieces = task(async () => {
    // enforce all new pieces must have type on document container
    const typesPromises = this.newPieces.map(async (piece) => {
      const container = await piece.documentContainer;
      const type = await container.type;
      return type;
    });
    const types = await all(typesPromises);
    if (types.some(type => !type)) {
      this.toaster.error(
        this.intl.t('document-type-required'),
        this.intl.t('warning-title'),
      );
      return;
    }
    const savePromises = this.sortedNewPieces.map(async (piece, index) => {
      try {
        await this.savePiece.perform(piece, index);
        this.pieces.push(piece);
        this.pieces = [...this.pieces];
        addObject(this.highlightedPieces, piece);
      } catch (error) {
        await this.deletePiece(piece);
        throw error;
      }
    });
    await all(savePromises);
    this.isOpenPieceUploadModal = false;
    this.newPieces = new TrackedArray([]);
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
        this.intl.t('warning-title'),
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

  cancelCreateSubmission = () => {
    this.isOpenCreateSubmissionModal = false;
    this.approvalComment = null;
    this.notificationComment = null;
  }

  createSubmission = task(async () => {
    const now = new Date();

    const submitted = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.SUBMISSION_STATUSES.INGEDIEND
    );
    const updateSubmitted = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.SUBMISSION_STATUSES.UPDATE_INGEDIEND
    );

    const type = await this.model.type;
    const agendaItemType = await this.model.agendaItemType;
    const decisionmakingFlow = await this.model.decisionmakingFlow;
    const mandatees = await this.model.mandatees;
    const requestedBy = await this.model.requestedBy;
    const governmentAreas = await this.model.governmentAreas;

    const submissions = await this.model.submissions;
    const originalSubmission = submissions
      .slice()
      .sort((s1, s2) => s1.created.getTime() - s2.created.getTime())
      .at(0);
    const meeting = await originalSubmission.meeting;

    const status = originalSubmission ? updateSubmitted : submitted;

    this.submission = this.store.createRecord('submission', {
      meeting,
      created: now,
      modified: now,
      shortTitle: trimText(this.model.shortTitle),
      confidential: this.model.confidential,
      subcase: this.model,
      type,
      agendaItemType,
      decisionmakingFlow,
      approvedBy: originalSubmission?.approvedBy,
      approvalComment: trimText(this.approvalComment),
      notified: originalSubmission?.notified,
      notificationComment: trimText(this.notificationComment),
      mandatees,
      requestedBy,
      governmentAreas,
      status,
      pieces: this.highlightedPieces,
    });

    await this.submission.save();

    await Promise.all(this.highlightedPieces.map((p) => {
      p.submission = this.submission;
      return p.save();
    }));

    // Create submission change
    const submissionStatusChange = this.store.createRecord(
      'submission-status-change-activity',
      {
        startedAt: now,
        comment: this.comment,
        submission: this.submission,
        status,
      }
    );
    await submissionStatusChange.save();

    this.router.transitionTo('cases.submissions.submission', this.submission.id);
  });
}