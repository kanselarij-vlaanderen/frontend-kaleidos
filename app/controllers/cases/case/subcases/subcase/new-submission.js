import Controller from '@ember/controller';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { TrackedArray } from 'tracked-built-ins';
import { task, dropTask, all } from 'ember-concurrency';
import { addObject, removeObject } from 'frontend-kaleidos/utils/array-helpers';
import VRCabinetDocumentName from 'frontend-kaleidos/utils/vr-cabinet-document-name';
import VRDocumentName from 'frontend-kaleidos/utils/vr-document-name';
import { findDocType } from 'frontend-kaleidos/utils/document-type';
import { containsConfidentialPieces } from 'frontend-kaleidos/utils/documents';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { trimText } from 'frontend-kaleidos/utils/trim-util';
import { isSameDay } from 'date-fns';

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
  @service preventUnload;
  @service subcaseService;

  defaultAccessLevel;

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

  @tracked isForPostponedSubcase;

  get confirmButtonLabel() {
    return this.isForPostponedSubcase
      ? this.intl.t('resubmit-postponed-agendaitem')
      : this.intl.t('new-submission');
  }

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
    // pop up notifications changed?
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

  validateFile = (file) => {
    return this.draftSubmissionService.validateUploadedFile(file);
  }

  uploadPiece = async (file) => {
    const existingPieceName = this.pieces[0].name;
    const existingSubject = new VRDocumentName(existingPieceName).subjectOnly();
    const name = file.filenameWithoutExtension;
    const parsed = new VRCabinetDocumentName(name).parsed;
    const type = await findDocType(this.conceptStore, parsed.type);
    const nameToSet = existingSubject ? existingSubject : parsed.subject;
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
      name: nameToSet,
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
    this.preventUnload.disable();
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

  createSubmission = dropTask(async (_meeting) => {
    this.isOpenCreateSubmissionModal = false;

    const submitted = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.SUBMISSION_STATUSES.INGEDIEND
    );
    const updateSubmitted = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.SUBMISSION_STATUSES.UPDATE_INGEDIEND
    );
    const postponedSubmitted = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.SUBMISSION_STATUSES.UITGESTELD_PUNT_INGEDIEND
    )

    const type = await this.model.type;
    const agendaItemType = await this.model.agendaItemType;
    const decisionmakingFlow = await this.model.belongsTo('decisionmakingFlow').reload();
    const mandatees = await this.mandatees;
    const requestedBy = await this.requestedBy;
    const governmentAreas = await this.model.governmentAreas;

    let meeting;
    // this _meeting can be a pointer event when coming from the confirmation model
    if (_meeting?.plannedStart) {
      meeting = _meeting;
    } else if (this.previousSubmission) {
      // this fixes a cache issue that leaves meeting null for KDB
      // only open meetings should be found / submitted to
      meeting = await this.store.queryOne('meeting', {
        'filter[:has:planned-start]': `date-added-for-cache-busting-${new Date().toISOString()}`,
        ':has-no:agenda': true,
        'filter[submissions][:id:]': this.previousSubmission.id
      });
    }

    const decisionActivity = await this.subcaseService.getLatestDecisionActivity(this.model);
    const decisionResultCode = await decisionActivity?.decisionResultCode;
    const relatedAgendas = await this.subcaseService.getRelatedAgendas(this.model);
    let oldMeeting = null; // -- 18/12
    let isReSubmittingPostponed = false;
    if (relatedAgendas.length) {
      if (
        relatedAgendas[0].agenda.status.uri === CONSTANTS.AGENDA_STATUSSES.APPROVED &&
        decisionResultCode?.uri === CONSTANTS.DECISION_RESULT_CODE_URIS.UITGESTELD
      ) {
        // in this case, getting decision result from data instead of sudo ensures decisions were released
        // when Cabinet member requests the resubmitting of a postpone subcase
        isReSubmittingPostponed = true;
        oldMeeting = relatedAgendas[0].meeting;
      } else if (relatedAgendas.length > 1 &&
        relatedAgendas[1].agenda.status.uri === CONSTANTS.AGENDA_STATUSSES.APPROVED &&
        relatedAgendas[1].decisionResultCode?.uri === CONSTANTS.DECISION_RESULT_CODE_URIS.UITGESTELD && 
        !isSameDay(relatedAgendas[0].meeting.plannedStart, (meeting.plannedStart))
      ) {
        // if secretarie postponed/resubmitted, there is no correct "previousSubmission" to get the meeting from
        // in that case, there will be 2 agendas but only a submission to the original one
        // else if in case multiple postpone/resubmit happened we do not want to hit this when the first condition is true
        // Cabinet member did not request the resubmitting in this case
        const approvedAgendaitem = await this.store.queryOne('agendaitem', {
          'filter[agenda-activity][:id:]': relatedAgendas[0].agendaActivity.id,
          'filter[:has-no:next-version]': 't',
          sort: '-created',
        });
        if (!approvedAgendaitem?.id) {
          // this is the first update submission since resubmitting, mails need to reflect this
          oldMeeting = relatedAgendas[1].meeting;
          isReSubmittingPostponed = false;
        }
        // needs to happen in both cases. local variable meeting is the incorrect meeting
        meeting = relatedAgendas[0].meeting;
      }
      else if (relatedAgendas.length > 1 &&
        relatedAgendas[0].agenda.status.uri === CONSTANTS.AGENDA_STATUSSES.DESIGN &&
        relatedAgendas[0].decisionResultCode?.uri === CONSTANTS.DECISION_RESULT_CODE_URIS.INGETROKKEN &&
        relatedAgendas[1].agenda.status.uri === CONSTANTS.AGENDA_STATUSSES.DESIGN &&
        relatedAgendas[1].agendaActivity.startDate > relatedAgendas[0].agendaActivity.startDate
      ) {
        // when secretarie retracts/resubmits, there is no correct "previousSubmission" to get the meeting from
        // in that case, there will be 2 design agendas but only a submission to the original one.
        // also, no decisionResultCode will be available at this time.
        // the meeting will be earlier in time aswell, but the agenda-activity will be more recently started.
        // We should not name oldMeeting here, since it will trigger the email to contain "uitgesteld".
        meeting = relatedAgendas[1].meeting;
      }
    }

    // originalSubmission points to the very first submission, which is not what we want when postponed and resubmitted.
    // this.previousSubmission should be ok to verify if this was an update or postponed to get the plannedStart
    const status =  this.isForPostponedSubcase
      ? postponedSubmitted
      : this.previousSubmission
      ? updateSubmitted
      : submitted;
    const plannedStart = meeting?.plannedStart; // we should have a meeting at this point    -- || this.previousSubmission?.plannedStart;
    if (!plannedStart) {
      // We should never continue without a meeting or plannedStart at this stage.
      this.toaster.error(
        this.intl.t('error-while-submitting-subcase-on-meeting', {
          error: "no-meeting-found-for-submission",
        }),
        this.intl.t('warning-title')
      );
    }

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
        await this.cabinetMail.sendUpdateSubmissionMails(this.submission, meeting, oldMeeting, isReSubmittingPostponed);
        this.preventUnload.disable();
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
