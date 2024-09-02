import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { TrackedArray } from 'tracked-built-ins';
import { task, dropTask, all } from 'ember-concurrency';
import { addObject, removeObject } from 'frontend-kaleidos/utils/array-helpers';
import VRCabinetDocumentName from 'frontend-kaleidos/utils/vr-cabinet-document-name';
import { findDocType } from 'frontend-kaleidos/utils/document-type';
import { containsConfidentialPieces } from 'frontend-kaleidos/utils/documents';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { trimText } from 'frontend-kaleidos/utils/trim-util';

export default class CasesCaseSubcasesSubcaseNewSubmissionController extends Controller {
  @service cabinetMail;
  @service conceptStore;
  @service intl;
  @service router;
  @service store;
  @service toaster;
  @service fileConversionService;
  @service currentSession;
  @service documentService;
  @service agendaService;
  @service draftSubmissionService;

  defaultAccessLevel;
  originalSubmission;

  @tracked isOpenPieceUploadModal = false;
  @tracked isOpenCreateSubmissionModal = false;

  @tracked hasConfidentialPieces = false;
  @tracked comment;
  @tracked approvalComment;
  @tracked notificationComment;
  @tracked approvalAddresses = new TrackedArray([]);
  @tracked notificationAddresses = new TrackedArray([]);
  @tracked pieces = new TrackedArray([]);
  @tracked newPieces = new TrackedArray([]);
  @tracked newDraftPieces = new TrackedArray([]);
  @tracked requestedBy = null;
  @tracked mandatees = new TrackedArray([]);

  get sortedNewPieces() {
    return this.newPieces.slice().sort((p1, p2) => {
      const d1 = p1.belongsTo('documentContainer').value();
      const d2 = p2.belongsTo('documentContainer').value();

      return d1.position - d2.position || p1.created - p2.created;
    });
  }

  disableMandatee = (mandatee) => {
    return this.requestedBy.id === mandatee.id;
  };

  checkConfidentiality = async () => {
    this.hasConfidentialPieces = await containsConfidentialPieces(this.pieces);
  };

  onAddNewPieceVersion = async (piece, newVersion) => {
    const documentContainer = await newVersion.documentContainer;
    await documentContainer.save();
    await newVersion.save();
    try {
      const sourceFile = await newVersion.file;
      await this.fileConversionService.convertSourceFile(sourceFile);
    } catch (error) {
      this.toaster.error(
        this.intl.t('error-convert-file', { message: error.message }),
        this.intl.t('warning-title'),
      );
    }
    const index = this.pieces.indexOf(piece);
    this.pieces[index] = newVersion;
    this.pieces = [...this.pieces];
    addObject(this.newDraftPieces, newVersion);
    await this.checkConfidentiality();
  };

  onDeletePiece = async (piece, previousPiece) => {
    const index = this.pieces.indexOf(piece);
    if (index > -1) {
      if (previousPiece) {
        this.pieces[index] = previousPiece;
      } else {
        this.pieces.splice(index, 1);
      }
      this.pieces = [...this.pieces];
      removeObject(this.newDraftPieces, piece);
      await this.checkConfidentiality();
    }
  };

  uploadPiece = async (file) => {
    const name = file.filenameWithoutExtension;
    const parsed = new VRCabinetDocumentName(name).parsed;
    const type = await findDocType(this.conceptStore, parsed.type);
    const accessLevel = parsed.confidential ? await this.store.findRecordByUri(
      'concept', CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK
    ) : this.defaultAccessLevel;

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
      accessLevel: accessLevel,
      name: parsed.subject,
      documentContainer: documentContainer,
    });
    this.newPieces.push(piece);
    await this.checkConfidentiality();
  }

  deletePiece = async (piece) => {
    const file = await piece.file;
    await file.destroyRecord();
    removeObject(this.newPieces, piece);
    const documentContainer = await piece.documentContainer;
    await documentContainer.destroyRecord();
    await piece.destroyRecord();
    await this.checkConfidentiality();
  }

  savePieces = task(async () => {
    const typesRequired = await this.documentService.enforceDocType(this.newPieces);
    if (typesRequired) return;

    const savePromises = this.sortedNewPieces.map(async (piece, index) => {
      try {
        await this.savePiece.perform(piece, index);
        this.pieces.push(piece);
        this.pieces = [...this.pieces];
        addObject(this.newDraftPieces, piece);
      } catch (error) {
        await this.deletePiece(piece);
        throw error;
      }
    });
    await all(savePromises);
    this.isOpenPieceUploadModal = false;
    this.newPieces = new TrackedArray([]);
    await this.checkConfidentiality();
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

  deleteDraftPieces = task(async () => {
    const deletePromises = this.newDraftPieces.map((piece) =>
      this.deleteDraftPiece(piece)
    );
    await Promise.all(deletePromises);
    this.newDraftPieces = new TrackedArray([]);
  });

  deleteDraftPiece = async (piece) => {
    const file = await piece.file;
    await file.destroyRecord();
    removeObject(this.newDraftPieces, piece);
    const documentContainer = await piece.documentContainer;
    await documentContainer.destroyRecord();
    await piece.destroyRecord();
  }

  cancelForm = task(async () => {
    await this.deleteDraftPieces.perform();
    this.router.transitionTo('cases.case.subcases.subcase');
  });

  cancelCreateSubmission = () => {
    this.isOpenCreateSubmissionModal = false;
    this.approvalComment = null;
    this.notificationComment = null;
  }

  onMandateeDataChanged = async ({ submitter, mandatees }) => {
    this.mandatees = mandatees;
    this.requestedBy = submitter;

    this.mandatees = this.mandatees
      .slice()
      .sort((m1, m2) => m1.priority - m2.priority);
  };

  onNotificationDataChanged = async (newNotificationData) => {
    this.approvalAddresses = newNotificationData.approvalAddresses;
    this.approvalComment = newNotificationData.approvalComment;
    this.notificationAddresses = newNotificationData.notificationAddresses;
    this.notificationComment = newNotificationData.notificationComment;
  };

  createSubmission = dropTask(async () => {
    this.isOpenCreateSubmissionModal = false;

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
    const decisionmakingFlow = await this.model.belongsTo('decisionmakingFlow').reload();
    const mandatees = await this.mandatees;
    const requestedBy = await this.requestedBy;
    const governmentAreas = await this.model.governmentAreas;

    let meeting;
    if (this.originalSubmission) {
      // this fixes a cache issue that leaves meeting null for KDB
      meeting = await this.store.queryOne('meeting', {
        'filter[:has:planned-start]': `date-added-for-cache-busting-${new Date().toISOString()}`,
        'filter[submissions][:id:]': this.originalSubmission.id
      });
    }

    const status = this.originalSubmission ? updateSubmitted : submitted;
    const plannedStart = meeting?.plannedStart || this.originalSubmission?.plannedStart;

    this.submission = this.store.createRecord('submission', {
      shortTitle: trimText(this.model.shortTitle),
      title: trimText(this.model.title),
      subcaseName: this.model.subcaseName,
      confidential: this.model.confidential,
      subcase: this.model,
      type,
      agendaItemType,
      decisionmakingFlow,
      approvalAddresses: this.approvalAddresses,
      approvalComment: trimText(this.approvalComment),
      notificationAddresses: this.notificationAddresses,
      notificationComment: trimText(this.notificationComment),
      mandatees,
      requestedBy,
      governmentAreas,
      status,
      pieces: this.newDraftPieces,
      plannedStart
    });

    await this.submission.save();

    await Promise.all(this.newDraftPieces.map((p) => {
      p.submission = this.submission;
      return p.save();
    }));

    this.newDraftPieces = new TrackedArray([]);

    // Create submission change
    await this.draftSubmissionService.createStatusChange(this.submission, status.uri, this.comment);

    if (meeting) {
      try {
        await this.agendaService.putDraftSubmissionOnAgenda(
          meeting,
          this.submission
        );
        await this.cabinetMail.sendUpdateSubmissionMails(this.submission, meeting);
        this.router.transitionTo('cases.submissions.submission', this.submission.id);
      } catch (error) {
        this.toaster.error(
          this.intl.t('error-while-submitting-subcase-on-meeting', {
            error: error.message,
          }),
          this.intl.t('warning-title')
        );
      }
    }
  });
}
