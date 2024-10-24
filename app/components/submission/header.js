import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task, dropTask, enqueueTask } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { deletePiece } from 'frontend-kaleidos/utils/document-delete-helpers';
import { isPresent } from '@ember/utils';
import { addObject } from 'frontend-kaleidos/utils/array-helpers';
import { trimText } from 'frontend-kaleidos/utils/trim-util';

export default class SubmissionHeaderComponent extends Component {
  @service agendaService;
  @service cabinetMail;
  @service currentSession;
  @service documentService;
  @service intl;
  @service router;
  @service store;
  @service toaster;
  @service pieceUpload;
  @service subcaseService;
  @service agendaitemAndSubcasePropertiesSync;
  @service draftSubmissionService;
  @service pieceAccessLevelService;

  @tracked isOpenResubmitModal;
  @tracked isOpenCreateSubcaseModal;
  @tracked isOpenRequestSendBackModal;
  @tracked isOpenSendBackModal;
  @tracked isOpenDeleteModal;
  @tracked piecesMovedCounter = 0;

  @tracked comment;

  @tracked requestedByIsCurrentMandatee;
  @tracked selectedAgenda;
  @tracked selectedMeeting;

  constructor() {
    super(...arguments);
    this.loadAgenda.perform();
    this.loadRequestedByIsCurrentMandatee.perform();
  }

  loadAgenda = task(async () => {
    if (this.args.submission) {
      const meeting = await this.args.submission.meeting;
      if (meeting?.id && this.currentSession.may('create-subcases-from-submissions')) {
        // only editors can use the store if not propagated yet
        this.selectedMeeting = meeting;
        this.selectedAgenda = await this.store.queryOne('agenda', {
          'filter[created-for][:id:]': meeting.id,
          'filter[:has-no:next-version]': true,
        });
      } else {
        // get meeting when not propagated yet
        const agenda = await this.agendaService.getAgendaAndMeetingForSubmission(this.args.submission);

        this.selectedAgenda = agenda;
        this.selectedMeeting = agenda.createdFor;
      }
    }
  });

  loadRequestedByIsCurrentMandatee = task(async () => {
    if (this.args.submission) {
      const requestedBy = await this.args.submission.requestedBy;
      const organization = await this.store.queryOne('user-organization', {
        'filter[mandatees][:id:]': requestedBy.id,
        'filter[:id:]': this.currentSession.organization.id,
      });
      this.requestedByIsCurrentMandatee = !!organization;
    }
  });

  get items() {
    const items = [
      { elementId: 'submission', label: this.intl.t('overview') },
      { elementId: 'documents', label: this.intl.t('documents') }
    ];
    if (!this.args.disableHistory) {
      items.push({
        elementId: 'history', label: this.intl.t('submission-history')
      });
    }
    return items;
  }

  get isUpdate() {
    return !!this.args.subcase?.id;
  }

  get canResubmitSubmission() {
    return (
      this.args.submission?.isSentBack &&
      this.currentSession.may('edit-sent-back-submissions') &&
      this.requestedByIsCurrentMandatee
    );
  }

  get canRequestSendBack() {
    return (
      (this.args.submission?.isSubmitted ||
        this.args.submission?.isUpdateSubmitted ||
        this.args.submission?.isResubmitted) && 
      this.currentSession.may('edit-sent-back-submissions') &&
      this.requestedByIsCurrentMandatee
    );
  }

  get canCreateSubcase() {
    return (
      this.args.submission?.isInTreatment &&
      this.currentSession.may('create-subcases-from-submissions')
    );
  }

  get canTakeInTreatment() {
    return (
      (this.args.submission?.isSubmitted ||
        this.args.submission?.isResubmitted ||
        this.args.submission?.isUpdateSubmitted ||
        this.args.submission?.isSendBackRequested) &&
      this.currentSession.may('edit-in-treatment-submissions')
    );
  }

  get canSendBackToSubmitter() {
    return (
      (this.args.submission?.isInTreatment ||
        this.args.submission?.isSendBackRequested) &&
      this.currentSession.may('edit-in-treatment-submissions')
    );
  }

  get canDeleteSubmission() {
    return this.currentSession.may('delete-submissions');
  }

  get hasActions() {
    return (
      this.canTakeInTreatment ||
      (this.args.hasActions &&
        (
          this.canCreateSubcase ||
          this.canSendBackToSubmitter ||
          this.canDeleteSubmission
        )
      )
    );
  }

  get isSendBackRequested() {
    return this.args.submission?.isSendBackRequested;
  }

  // Modal helpers
  toggleResubmitModal = () => {
    this.isOpenResubmitModal = !this.isOpenResubmitModal;
    this.comment = null;
  };

  toggleCreateSubcaseModal = () => {
    this.isOpenCreateSubcaseModal = !this.isOpenCreateSubcaseModal;
    this.comment = null;
  };

  toggleRequestSendBackModal = () => {
    this.isOpenRequestSendBackModal = !this.isOpenRequestSendBackModal;
    this.comment = null;
  };

  toggleSendBackModal = () => {
    this.isOpenSendBackModal = !this.isOpenSendBackModal;
    this.comment = null;
  };

  toggleDeleteModal = () => {
    this.isOpenDeleteModal = !this.isOpenDeleteModal;
    this.comment = null;
  };

  /**
   * @private
   */
  _updateSubmission = async (statusUri, comment) => {
    await this.draftSubmissionService.updateSubmissionStatus(this.args.submission, statusUri, comment);
  };

  resubmitSubmission = task(async () => {
    await this._updateSubmission(
      CONSTANTS.SUBMISSION_STATUSES.OPNIEUW_INGEDIEND,
      this.comment
    );
    await this.cabinetMail.sendResubmissionMails(this.args.submission, this.comment, this.selectedMeeting);
    if (isPresent(this.args.onStatusUpdated)) {
      this.args.onStatusUpdated();
    }
  });

  movePiece = enqueueTask({ maxConcurrency: 5 }, async (draftPiece) => {
    const now = new Date();
    const previousPiece = await draftPiece.previousPiece;
    const accessLevel = await draftPiece.accessLevel;
    let documentContainer;

    if (!previousPiece) {
      const draftDocumentContainer = await draftPiece.documentContainer;
      const type = await draftDocumentContainer.type;
      documentContainer = this.store.createRecord(
        'document-container',
        {
          position: draftDocumentContainer.position,
          created: draftDocumentContainer.created,
          type,
        }
      );
      await documentContainer.save();
    } else {
      documentContainer = await previousPiece.documentContainer;
    }

    const draftFile = await draftPiece.file;
    const draftDerivedFile = await draftFile.derived;

    const file = await this.documentService.moveDraftFile(draftFile.id);

    if (draftDerivedFile) {
      const derivedFile = await this.documentService.moveDraftFile(
        draftDerivedFile.id
      );
      file.derived = derivedFile;
      await file.save();
    }

    const piece = this.store.createRecord('piece', {
      name: draftPiece.name,
      created: draftPiece.created,
      modified: now,
      previousPiece,
      accessLevel,
      file,
      documentContainer,
      originalName: previousPiece?.originalName,
      draftPiece: draftPiece
    });
    await piece.save();
    this.piecesMovedCounter++;
    // in submissions, we allow the strengthening of the accessLevel (from default > confidential) meaning we have to update all previous versions.
    await this.pieceAccessLevelService.updatePreviousAccessLevels(piece);
    return piece;
  });

  createSubcase = dropTask(
    async (
      _fullCopy = false, // unused
      meeting = null,
      formallyStatusUri,
      privateComment = null
    ) => {
      this.toggleCreateSubcaseModal();
      const now = new Date();
      const trimmedShortTitle = trimText(this.args.submission.shortTitle);
      const trimmedTitle =  trimText(this.args.submission.title);
      const subcaseName = this.args.submission.subcaseName;
      const type = await this.args.submission.type;
      const agendaItemType = await this.args.submission.agendaItemType;
      const requestedBy = await this.args.submission.requestedBy;
      const mandatees = await this.args.submission.mandatees;
      const governmentAreas = await this.args.submission.governmentAreas;

      const draftPieces = await this.args.submission.pieces;

      let decisionmakingFlow = await this.args.submission.belongsTo('decisionmakingFlow').reload();
      if (!decisionmakingFlow) {
        decisionmakingFlow = this.store.createRecord('decisionmaking-flow', {
          // TODO, title is not a known property in model (commented)
          title: this.args.submission.decisionmakingFlowTitle,
          opened: this.args.submission.created,
          governmentAreas,
        });
        await decisionmakingFlow.save();

        const _case = this.store.createRecord('case', {
          shortTitle: this.args.submission.decisionmakingFlowTitle,
          created: this.args.submission.created,
          decisionmakingFlow,
        });
        await _case.save();
        this.args.submission.decisionmakingFlow = decisionmakingFlow;
      }

      let subcase = await this.args.submission.subcase;
      if (!subcase) {
        let linkedPieces = [];
        const latestSubcase = await this.store.queryOne('subcase', {
          'filter[decisionmaking-flow][:id:]': decisionmakingFlow.id,
          sort: '-created',
        });
        if (latestSubcase) {
          linkedPieces = await this.subcaseService.loadSubcasePieces(
            latestSubcase
          );
        }
        subcase = this.store.createRecord('subcase', {
          shortTitle: trimmedShortTitle,
          title: trimmedTitle,
          subcaseName,
          created: this.args.submission.created,
          modified: now,
          confidential: this.args.submission.confidential,
          linkedPieces,
          type,
          decisionmakingFlow,
          requestedBy,
          agendaItemType,
          mandatees,
          governmentAreas,
        });
        await subcase.save();

        const internalReview = await this.args.submission.internalReview;
        if (internalReview?.id) {
          internalReview.subcase = subcase;
          await internalReview.save();
        } else {
          await this.agendaService.createInternalReview(subcase, [this.args.submission], privateComment);
        }
      } else {
        await subcase.belongsTo('requestedBy')?.reload();
        await subcase.hasMany('mandatees')?.reload();
        const propertiesToSetOnAgendaitem = {
          title: trimmedTitle,
          shortTitle: trimmedShortTitle,
          mandatees: mandatees,
        };
        const propertiesToSetOnSubcase = {
          title: trimmedTitle,
          shortTitle: trimmedShortTitle,
          type,
          subcaseName: subcaseName,
          mandatees: mandatees,
          requestedBy: requestedBy,
        };
        await this.agendaitemAndSubcasePropertiesSync.saveChanges(
          subcase,
          propertiesToSetOnAgendaitem,
          propertiesToSetOnSubcase,
          true,
        );
      }

      this.piecesMovedCounter = 0;
      const pieces = await Promise.all(
        draftPieces.map((draftPiece) => this.movePiece.perform(draftPiece))
      );

      const agendaActivity = await this.pieceUpload.getAgendaActivity(subcase);

      if (agendaActivity) {
        await this.pieceUpload.createSubmissionActivity(pieces, subcase, agendaActivity, this.args.submission);
        await this.pieceUpload.updateRelatedAgendaitems.perform(pieces, subcase);
      } else {
        await this.pieceUpload.updateSubmissionActivity(pieces, subcase, this.args.submission);
      }

      if (meeting) {
        try {
          await this.agendaService.putSubmissionOnAgenda(
            meeting,
            subcase,
            formallyStatusUri,
            privateComment
          );
        } catch (error) {
          this.toaster.error(
            this.intl.t('error-while-submitting-subcase-on-meeting', {
              error: error.message,
            }),
            this.intl.t('warning-title')
          );
        }
      }

      this.args.submission.subcase = subcase;
      await this._updateSubmission(CONSTANTS.SUBMISSION_STATUSES.BEHANDELD);
      this.router.transitionTo(
        'cases.case.subcases.subcase',
        decisionmakingFlow.id,
        subcase.id
      );
    }
  );

  takeInTreatment = async () => {
    // TODO update submission data? It could have been changed on subcase
    await this._updateSubmission(CONSTANTS.SUBMISSION_STATUSES.IN_BEHANDELING);
    await this.createOrUpdateInternalReview();
    if (isPresent(this.args.onStatusUpdated)) {
      this.args.onStatusUpdated();
    }
  };

  createOrUpdateInternalReview = async () => {
    // Do we have a subcase already?
    const internalReviewOfSubmission = await this.args.submission.internalReview;
    if (!this.isUpdate && internalReviewOfSubmission?.id) {
      return; // non-update submission already has an internal review
    }

    const internalReviewOfSubcase = await this.args.subcase?.internalReview;
    if (this.isUpdate && internalReviewOfSubcase?.id && !internalReviewOfSubmission?.id) {
      const submissions = await internalReviewOfSubcase.hasMany('submissions').reload();
      addObject(submissions, this.args.submission);
      internalReviewOfSubcase.submissions = submissions;
      return await internalReviewOfSubcase.save();
    }
  
    if (!internalReviewOfSubmission?.id) {
      await this.agendaService.createInternalReview(this.args.subcase, [this.args.submission], CONSTANTS.PRIVATE_COMMENT_TEMPLATE);
    }
    // else, update something? 
    // is there a chance that subcase has no internalReview but submission does?
    // not if we connect it when creating the subcase initially
    // sounds possible only on old data. new data should be fine
    // subcase should/will be connected on creation and is a read-only relation on subcase 
  };

  sendBackToSubmitter = task(async () => {
    await this._updateSubmission(
      CONSTANTS.SUBMISSION_STATUSES.TERUGGESTUURD,
      this.comment
    );
    await this.cabinetMail.sendBackToSubmitterMail(
      this.args.submission,
      this.comment,
      this.selectedMeeting,
    );
    if (isPresent(this.args.onStatusUpdated)) {
      this.args.onStatusUpdated();
    }
  });

  deleteSubmission = task(async () => {
    const pieces = await this.args.submission.pieces;
    await Promise.all(pieces.map(async (piece) => deletePiece(piece)));

    const statusChangeActivities = await this.draftSubmissionService.getStatusChangeActivities(this.args.submission);
    await statusChangeActivities?.map(async (activity) => {
      await activity.destroyRecord();
    });

    await this.args.submission.destroyRecord();

    await this.router.transitionTo('submissions');
  });

  requestSendBackToSubmitter = task(async () => {
    await this._updateSubmission(
      CONSTANTS.SUBMISSION_STATUSES.AANPASSING_AANGEVRAAGD,
      this.comment
    );
    await this.cabinetMail.sendRequestSendBackToSubmitterMail(
      this.args.submission,
      this.comment,
      this.selectedMeeting,
    );
    if (isPresent(this.args.onStatusUpdated)) {
      this.args.onStatusUpdated();
    }
  });
}
