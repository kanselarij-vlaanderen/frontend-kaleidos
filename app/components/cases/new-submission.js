import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { TrackedArray } from 'tracked-built-ins';
import { task, dropTask } from 'ember-concurrency';
import { trimText } from 'frontend-kaleidos/utils/trim-util';
import {
  addObject,
  addObjects,
  removeObject,
  removeObjects,
} from 'frontend-kaleidos/utils/array-helpers';
import CONSTANTS from 'frontend-kaleidos/config/constants';
/**
 * @param decisionmakingFlow
 * @param latestSubcase
 */
export default class CasesNewSubmissionComponent extends Component {
  @service agendaService;
  @service conceptStore;
  @service router;
  @service store;
  @service toaster;
  @service fileConversionService;
  @service intl;
  @service currentSession;

  @tracked selectedDecisionmakingFlow;
  @tracked decisionmakingFlowTitle;

  @tracked agendaItemType;
  @tracked confidential;
  @tracked shortTitle;

  @tracked type;

  @tracked notificationAddresses = ['secretarie@vlaanderen.be'];
  @tracked notificationMessage;
  @tracked CCAddresses;
  @tracked CCMessage;

  @tracked showAgendaModal = false;
  @tracked hasAgenda = false;

  @tracked submitter;
  @tracked mandatees;

  @tracked governmentAreas = new TrackedArray([]);
  @tracked selectedGovernmentDomains = new TrackedArray([]);
  @tracked selectedGovernmentFields = new TrackedArray([]);
  @tracked pieces = new TrackedArray([]);
  @tracked isUploadingFiles;

  @tracked showProposableAgendaModal = false;

  constructor() {
    super(...arguments);

    this.selectedDecisionmakingFlow = this.args.decisionmakingFlow;
    this.submitter = this.args.submitter;
    this.mandatees = this.args.mandatees;
    this.latestSubcase = this.args.latestSubcase;
    this.loadLatestSubcaseData.perform();
  }

  loadLatestSubcaseData = task(async () => {
    if (this.latestSubcase) {
      this.agendaItemType = await this.latestSubcase.agendaItemType;
      this.confidential = this.latestSubcase.confidential;
      this.shortTitle = this.latestSubcase.shortTitle;
      this.type = await this.latestSubcase.type;
      this.governmentAreas = await this.latestSubcase.governmentAreas;
      for (const governmentArea of this.governmentAreas) {
        await governmentArea.broader;
        if (governmentArea.broader) {
          this.selectedGovernmentFields.push(governmentArea);
        } else {
          this.selectedGovernmentDomains.push(governmentArea);
        }
      }
    }
  })

  get saveIsDisabled() {
    const decisionmakingFlowSet =
      !!this.selectedDecisionmakingFlow || !!this.decisionmakingFlowTitle;
    const subcaseTypeSet = !!this.type;
    return !decisionmakingFlowSet || !subcaseTypeSet || this.isUploadingFiles;
  }

  get sortedPieces() {
    return this.pieces.slice().sort((p1, p2) => {
      const d1 = p1.belongsTo('documentContainer').value();
      const d2 = p2.belongsTo('documentContainer').value();

      return d1?.position - d2?.position || p1.created - p2.created;
    });
  }

  filterSubcaseTypes = (subcaseTypes) => {
    return subcaseTypes.filter(
      (type) => type.uri !== CONSTANTS.SUBCASE_TYPES.BEKRACHTIGING
    );
  };

  disableMinisterCheckbox = (minister) => {
    const person = this.submitter?.belongsTo('person').value();
    return minister.id === person?.id;
  };

  selectField = (selectedField) => {
    addObjects(this.selectedGovernmentFields, selectedField);
  };

  deselectField = (selectedField) => {
    removeObjects(this.selectedGovernmentFields, selectedField);
  };

  selectDomain = (selectedDomain) => {
    addObjects(this.selectedGovernmentDomains, selectedDomain);
  };

  deselectDomain = (selectedDomain) => {
    removeObjects(this.selectedGovernmentDomains, selectedDomain);
  };

  addPiece = (piece) => {
    addObject(this.pieces, piece);
  };

  deletePiece = async (piece) => {
    const file = await piece.file;
    await file?.destroyRecord();
    removeObject(this.pieces, piece);
    const documentContainer = await piece?.documentContainer;
    await documentContainer?.destroyRecord();
    await piece?.destroyRecord();
  };

  deletePieces = async () => {
    const savePromises = this.pieces.map(async (piece) => {
      await this.deletePiece(piece);
    });
    await Promise.all(savePromises);
    this.pieces = new TrackedArray([]);
  };

  handleFileUploadQueueUpdates = ({ uploadIsRunning, uploadIsCompleted}) => {
    this.isUploadingFiles = uploadIsRunning && !uploadIsCompleted;
  };

  createSubmission = dropTask(async (meeting, comment) => {
    const now = new Date();

    const submitted = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.SUBMISSION_STATUSES.INGEDIEND
    );

    const _case = await this.selectedDecisionmakingFlow?.case;
    const decisionmakingFlowTitle =
      this.decisionmakingFlowTitle ??
      _case?.shortTitle ??
      '';
    const creator = await this.currentSession.user;
    this.submission = this.store.createRecord('submission', {
      created: now,
      modified: now,
      shortTitle: trimText(this.shortTitle ?? decisionmakingFlowTitle),
      title: trimText(this.decisionmakingFlowTitle),
      confidential: this.confidential,
      type: this.type,
      agendaItemType: this.agendaItemType,
      decisionmakingFlow: this.selectedDecisionmakingFlow,
      creator: creator,
      approvedBy: this.notificationAddresses,
      approvalComment: trimText(this.notificationMessage),
      notified: this.CCAddresses,
      notificationComment: trimText(this.CCMessage),
      mandatees: this.mandatees ?? [],
      requestedBy: this.submitter,
      governmentAreas: [
        ...this.selectedGovernmentFields,
        ...this.selectedGovernmentDomains,
      ],
      status: submitted,
      pieces: this.pieces,
    });

    await this.submission.save();

    await this.savePieces.perform();

    // Create submission change
    const submissionStatusChange = this.store.createRecord(
      'submission-status-change-activity',
      {
        startedAt: now,
        comment,
        submission: this.submission,
        status: submitted,
      }
    );
    await submissionStatusChange.save();

    if (meeting) {
      try {
        await this.agendaService.putDraftSubmissionOnAgenda(
          meeting,
          this.submission
        );
        this.router.transitionTo(
          'cases.submissions.submission',
          this.submission.id
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
  });

  savePieces = task(async () => {
    this.piecesCreatedCounter = 0;
    const savePromises = this.sortedPieces.map(async (piece, index) => {
      try {
        await this.savePiece.perform(piece, index);
      } catch (error) {
        await this.deletePiece(piece);
        throw error;
      }
    });
    await Promise.all(savePromises);
  });

  savePiece = task(
    { maxConcurrency: 5, enqueue: true },
    async (piece, index) => {
      const documentContainer = await piece.documentContainer;
      documentContainer.position = index + 1;
      await documentContainer.save();
      const defaultAccessLevel = await this.store.findRecordByUri(
        'concept',
        this.confidential
          ? CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK
          : CONSTANTS.ACCESS_LEVELS.INTERN_REGERING
      );
      piece.accessLevel = defaultAccessLevel;
      piece.accessLevelLastModified = new Date();
      piece.name = piece.name.trim();
      piece.submission = this.submission;
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
      this.piecesCreatedCounter++;
    }
  );

  cancelForm = task(async () => {
    await this.deletePieces();
    this.args?.onCancel();
  });

  openProposableAgendaModal = task(async () => {
    if (this.pieces.length) {
      // enforce all new pieces must have type on document container
      const typesPromises = this.pieces.map(async (piece) => {
        const container = await piece.documentContainer;
        const type = await container.type;
        return type;
      });
      const types = await Promise.all(typesPromises);
      if (types.some(type => !type)) {
        this.toaster.error(
          this.intl.t('document-type-required'),
          this.intl.t('warning-title'),
        );
        return;
      }
    }
    this.showProposableAgendaModal = true;
  });
}