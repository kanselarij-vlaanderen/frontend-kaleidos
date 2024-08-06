import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task, dropTask } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { addObject } from 'frontend-kaleidos/utils/array-helpers';
import { deletePiece } from 'frontend-kaleidos/utils/document-delete-helpers';
import { isPresent } from '@ember/utils';

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

  @tracked isOpenResubmitModal;
  @tracked isOpenCreateSubcaseModal;
  @tracked isOpenSendBackModal;
  @tracked isOpenDeleteModal;
  @tracked piecesMovedCounter = 0;

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
    return !!this.args.submission.subcase?.get('id');
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
        this.args.submission.isResubmitted ||
        this.args.submission.isUpdateSubmitted) &&
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
      this.canTakeInTreatment ||
      (this.args.hasActions &&
        (
          this.canResubmitSubmission ||
          this.canCreateSubcase ||
          this.canSendBackToSubmitter ||
          this.canDeleteSubmission
        )
      )
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
    await this.args.submission.updateStatus(statusUri, comment);
  };

  resubmitSubmission = task(async () => {
    await this._updateSubmission(
      CONSTANTS.SUBMISSION_STATUSES.OPNIEUW_INGEDIEND,
      this.comment
    );
    this.cabinetMail.sendResubmissionMails(this.args.submission, this.comment);
    if (isPresent(this.args.onStatusUpdated)) {
      this.args.onStatusUpdated();
    }
  });

  createSubcase = dropTask(
    async (
      _fullCopy = false, // unused
      meeting = null,
      isFormallyOk = false,
      privateComment = null
    ) => {
      this.toggleCreateSubcaseModal();
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

      let subcase = await this.args.submission.subcase;
      if (!subcase) {
        let linkedPieces = [];
        if (this.args.previousSubcase) {
          linkedPieces = await this.subcaseService.loadSubcasePieces(
            this.args.previousSubcase
          );
        }
        subcase = this.store.createRecord('subcase', {
          shortTitle: this.args.submission.shortTitle,
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
      } else {
        await subcase.belongsTo('requestedBy')?.reload();
        await subcase.hasMany('mandatees')?.reload();
        subcase.requestedBy = requestedBy;
        subcase.mandatees = mandatees;
      }
      await subcase.save();

      this.piecesMovedCounter = 0;
      const pieces = await Promise.all(
        draftPieces.map(async (draftPiece) => {
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

          let derivedFile;
          if (draftDerivedFile) {
            derivedFile = await this.documentService.moveDraftFile(
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
          return piece;
        })
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
    if (isPresent(this.args.onStatusUpdated)) {
      this.args.onStatusUpdated();
    }
  };

  sendBackToSubmitter = task(async () => {
    await this._updateSubmission(
      CONSTANTS.SUBMISSION_STATUSES.TERUGGESTUURD,
      this.comment
    );
    this.cabinetMail.sendBackToSubmitterMail(
      this.args.submission,
      this.comment
    );
    if (isPresent(this.args.onStatusUpdated)) {
      this.args.onStatusUpdated();
    }
  });

  deleteSubmission = task(async () => {
    const pieces = await this.args.submission.pieces;
    await Promise.all(pieces.map(async (piece) => deletePiece(piece)));

    await this.args.submission.destroyRecord();

    await this.router.transitionTo('cases.submissions');
  });
}
