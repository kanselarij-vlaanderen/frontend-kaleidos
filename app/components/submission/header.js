import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { addObject } from 'frontend-kaleidos/utils/array-helpers';
import { deletePiece } from 'frontend-kaleidos/utils/document-delete-helpers';

export default class SubmissionHeaderComponent extends Component {
  @service agendaService;
  @service currentSession;
  @service documentService;
  @service intl;
  @service router;
  @service store;
  @service toaster;

  @tracked isOpenResubmitModal;
  @tracked isOpenCreateSubcaseModal;
  @tracked isOpenSendBackModal;
  @tracked isOpenDeleteModal;

  @tracked comment;

  @tracked selectedAgenda;

  constructor() {
    super(...arguments);
    this.loadAgenda.perform();
  }

  loadAgenda = task(async () => {
    const meeting = await this.args.submission.meeting;
    if (meeting?.id) {
      this.selectedAgenda = await this.store.queryOne('agenda', {
        'filter[created-for][:id:]': meeting.id,
        'filter[:has-no:next-version]': true,
      });
    }
  });

  get items() {
    return [
      { elementId: 'submission', label: this.intl.t('overview') },
      { elementId: 'documents', label: this.intl.t('documents') },
      { elementId: 'agenda', label: this.intl.t('agenda-activities') },
    ];
  }

  get canResubmitSubmission() {
    return (
      this.args.submission.isSentBack &&
      this.currentSession.may('edit-sent-back-submissions')
    );
  }

  get canCreateSubcase() {
    return (
      this.args.submission.isInTreatment &&
      this.currentSession.may('create-subcases-from-submissions')
    );
  }

  get canTakeInTreatment() {
    return (
      (this.args.submission.isSubmitted ||
        this.args.submission.isResubmitted) &&
      this.currentSession.may('edit-in-treatment-submissions')
    );
  }

  get canSendBackToSubmitter() {
    return (
      this.args.submission.isInTreatment &&
      this.currentSession.may('edit-in-treatment-submissions')
    );
  }

  get canDeleteSubmission() {
    return this.currentSession.may('delete-submissions');
  }

  get hasActions() {
    return (
      this.canResubmitSubmission ||
      this.canCreateSubcase ||
      this.canTakeInTreatment ||
      this.canSendBackToSubmitter ||
      this.canDeleteSubmission
    );
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
    const now = new Date();
    const currentUser = this.currentSession.user;
    const newStatus = await this.store.findRecordByUri('concept', statusUri);

    const submissionStatusChange = this.store.createRecord(
      'submission-status-change-activity',
      {
        startedAt: now,
        comment,
        submission: this.args.submission,
        status: newStatus,
      }
    );
    await submissionStatusChange.save();

    this.args.submission.status = newStatus;
    this.args.submission.modified = now;
    this.args.submission.modifiedBy = currentUser;
    const statusChangeActivities = await this.args.submission
      .statusChangeActivities;
    addObject(statusChangeActivities, submissionStatusChange);

    await this.args.submission.save();
  };

  resubmitSubmission = task(async () => {
    await this._updateSubmission(
      CONSTANTS.SUBMISSION_STATUSES.OPNIEUW_INGEDIEND,
      this.comment
    );
  });

  createSubcase = task(
    async (
      _fullCopy = false, // unused
      meeting = null,
      isFormallyOk = false,
      privateComment = null
    ) => {
      const now = new Date();

      const type = await this.args.submission.type;
      const agendaItemType = await this.args.submission.agendaItemType;
      const requestedBy = await this.args.submission.requestedBy;
      const mandatees = await this.args.submission.mandatees;
      const governmentAreas = await this.args.submission.governmentAreas;

      const draftPieces = await this.args.submission.pieces;

      let decisionmakingFlow = await this.args.submission.decisionmakingFlow;
      if (!decisionmakingFlow) {
        decisionmakingFlow = this.store.createRecord('decisionmaking-flow', {
          title: this.args.submission.title,
          opened: this.args.submission.created,
          governmentAreas,
          submissions: [this.args.submission],
        });
        await decisionmakingFlow.save();

        const _case = this.store.createRecord('case', {
          shortTitle: this.args.submission.title,
          created: this.args.submission.created,
          decisionmakingFlow,
        });
        await _case.save();
      } else {
        const submissions = await decisionmakingFlow.submissions;
        addObject(submissions, this.args.submission);
        await decisionmakingFlow.save();
      }

      const subcase = this.store.createRecord('subcase', {
        shortTitle: this.args.submission.shortTitle,
        created: this.args.submission.created,
        modified: now,
        confidential: this.args.submission.confidential,
        type,
        decisionmakingFlow,
        requestedBy,
        agendaItemType,
        mandatees,
        governmentAreas,
      });
      await subcase.save();

      const pieces = await Promise.all(
        draftPieces.map(async (draftPiece) => {
          const draftDocumentContainer = await draftPiece.documentContainer;
          const type = await draftDocumentContainer.type;
          const accessLevel = await draftPiece.accessLevel;

          const draftFile = await draftPiece.file;
          const draftDerivedFile = await draftFile.derived;

          const file = await this.documentService.moveDraftFile(draftFile.id);

          let derivedFile;
          if (draftDerivedFile) {
            derivedFile = await this.documentService.moveDraftFile(
              draftDerivedFile.id
            );
            file.derived = derivedFile;
            await file.save();
          }

          const documentContainer = this.store.createRecord(
            'document-container',
            {
              position: draftDocumentContainer.position,
              created: draftDocumentContainer.created,
              type,
            }
          );
          await documentContainer.save();

          const piece = this.store.createRecord('piece', {
            name: draftPiece.name,
            created: draftPiece.created,
            modified: now,
            accessLevel,
            file,
            documentContainer,
          });
          await piece.save();
          return piece;
        })
      );

      const submissionActivity = this.store.createRecord(
        'submission-activity',
        {
          startDate: now,
          subcase: subcase,
          pieces,
        }
      );
      await submissionActivity.save();

      if (meeting) {
        try {
          await this.agendaService.putSubmissionOnAgenda(
            meeting,
            subcase,
            isFormallyOk,
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
      await this._updateSubmission(CONSTANTS.SUBMISSION_STATUSES.AANVAARD);

      this.router.transitionTo(
        'cases.case.subcases.subcase',
        decisionmakingFlow.id,
        subcase.id
      );
    }
  );

  takeInTreatment = async () => {
    const currentUser = this.currentSession.user;
    this.args.submission.beingTreatedBy = currentUser;
    await this._updateSubmission(CONSTANTS.SUBMISSION_STATUSES.IN_BEHANDELING);
  };

  sendBackToSubmitter = task(async () => {
    await this._updateSubmission(
      CONSTANTS.SUBMISSION_STATUSES.TERUGGESTUURD,
      this.comment
    );
  });

  deleteSubmission = task(async () => {
    const pieces = await this.args.submission.pieces;
    await Promise.all(pieces.map(async (piece) => deletePiece(piece)));

    await this.args.submission.destroyRecord();

    await this.router.transitionTo('cases.submissions');
  });
}
