import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { TrackedArray } from 'tracked-built-ins';
import { task, dropTask, timeout } from 'ember-concurrency';
import { trimText } from 'frontend-kaleidos/utils/trim-util';
import { containsConfidentialPieces } from 'frontend-kaleidos/utils/documents';
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
  @service cabinetMail;
  @service conceptStore;
  @service fileConversionService;
  @service intl;
  @service router;
  @service store;
  @service toaster;
  @service currentSession;
  @service documentService;
  @service draftSubmissionService;

  @tracked selectedDecisionmakingFlow;
  @tracked decisionmakingFlowTitle;

  @tracked agendaItemType;
  @tracked confidential = false;
  @tracked hasConfidentialPieces = false;
  @tracked shortTitle;
  @tracked title;
  @tracked subcaseName;

  @tracked type;

  @tracked showAgendaModal = false;
  @tracked hasAgenda = false;

  @tracked approvalAddresses = new TrackedArray([]);
  @tracked approvalComment;
  @tracked notificationAddresses = new TrackedArray([]);
  @tracked notificationComment;

  @tracked submitter;
  @tracked mandatees;

  @tracked governmentAreas = new TrackedArray([]);
  @tracked selectedGovernmentDomains = new TrackedArray([]);
  @tracked selectedGovernmentFields = new TrackedArray([]);
  @tracked pieces = new TrackedArray([]);
  @tracked isUploadingFiles;
  @tracked piecesCreatedCounter = 0;

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
      this.title = this.latestSubcase.title;
      this.subcaseName = this.latestSubcase.subcaseName;
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

  // TODO short title of submission should be mandatory
  // also when choosing an existing case, we could copy shortTitle of Case into submission shortTitle
  get saveIsDisabled() {
    const decisionmakingFlowSet = this.args.isForNewCase
      ? !!this.shortTitle
      : !!this.selectedDecisionmakingFlow || !!this.decisionmakingFlowTitles;
    const subcaseTypeSet = !!this.type;
    return (
      !decisionmakingFlowSet ||
      !subcaseTypeSet ||
      this.isUploadingFiles ||
      !this.pieces.length ||
      this.createSubmission.isRunning
    );
  }

  get sortedPieces() {
    return this.pieces.slice().sort((p1, p2) => {
      const d1 = p1.belongsTo('documentContainer').value();
      const d2 = p2.belongsTo('documentContainer').value();

      return d1?.position - d2?.position || p1.created - p2.created;
    });
  }

  onDecisionmakingFlowChanged = async (decisionmakingFlow) => {
    this.selectedDecisionmakingFlow = decisionmakingFlow;
    if (!this.shortTitle) {
      // this can trigger without a selection, so optionals needed
      const decisionmakingFlowCase = await decisionmakingFlow?.case;
      this.shortTitle = decisionmakingFlowCase?.shortTitle;
    }
  }

  onDecisionmakingFlowTitleChanged = (decisionmakingFlowTitle) => {
    this.decisionmakingFlowTitle = decisionmakingFlowTitle;
    if (!this.shortTitle) {
      this.shortTitle = decisionmakingFlowTitle;
    }
  }

  onNotificationDataChanged = (newSubmissionData) =>  {
    this.approvalAddresses = newSubmissionData.approvalAddresses;
    this.approvalComment = newSubmissionData.approvalComment;
    this.notificationAddresses = newSubmissionData.notificationAddresses;
    this.notificationComment = newSubmissionData.notificationComment;
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

  addPiece = async (piece) => {
    addObject(this.pieces, piece);
    await this.checkConfidentiality();
    await timeout(100); // wait for doc to be rendered
    const fragmentElement = document.getElementsByClassName('scrollable-uploaded-document')[0];
    if (fragmentElement) {
      fragmentElement.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  };

  deletePiece = async (piece) => {
    const file = await piece.file;
    await file?.destroyRecord();
    removeObject(this.pieces, piece);
    const documentContainer = await piece?.documentContainer;
    await documentContainer?.destroyRecord();
    await piece?.destroyRecord();
    await this.checkConfidentiality();
  };

  deletePieces = async () => {
    const savePromises = this.pieces.map(async (piece) => {
      await this.deletePiece(piece);
    });
    await Promise.all(savePromises);
    this.pieces = new TrackedArray([]);
    await this.checkConfidentiality();
  };

  checkConfidentiality = async () => {
    this.hasConfidentialPieces = await containsConfidentialPieces(this.pieces);
  };

  handleFileUploadQueueUpdates = ({ uploadIsRunning, uploadIsCompleted}) => {
    this.isUploadingFiles = uploadIsRunning && !uploadIsCompleted;
  };

  createSubmission = dropTask(async (meeting, comment) => {
    this.showProposableAgendaModal = false;
    const submitted = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.SUBMISSION_STATUSES.INGEDIEND
    );

    const _case = await this.selectedDecisionmakingFlow?.case;
    const decisionmakingFlowTitle =
      this.decisionmakingFlowTitle ??
      _case?.shortTitle ??
      this.shortTitle ??
      '';
    this.submission = this.store.createRecord('submission', {
      shortTitle: trimText(this.shortTitle ?? decisionmakingFlowTitle),
      title: trimText(this.title),
      subcaseName: this.subcaseName,
      confidential: this.confidential,
      type: this.type,
      agendaItemType: this.agendaItemType,
      // either we set the decisionmakingFlowTitle or the decisionmakingFlow, never both
      decisionmakingFlowTitle: this.selectedDecisionmakingFlow ? '' : trimText(decisionmakingFlowTitle),
      decisionmakingFlow: this.selectedDecisionmakingFlow,
      approvalAddresses: this.approvalAddresses,
      approvalComment: this.approvalComment,
      notificationAddresses: this.notificationAddresses,
      notificationComment: this.notificationComment,
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
    await this.draftSubmissionService.createStatusChange(this.submission, submitted.uri, comment);
    await this.createNotificationMailResources(meeting);

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

  async createNotificationMailResources(meeting) {
    if (this.approvalAddresses.length && this.notificationAddresses.length) {
      await this.cabinetMail.sendFirstSubmissionMails(this.submission, meeting);
    }
  }

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
      if (!piece.accessLevel) {
        piece.accessLevel = defaultAccessLevel;
      }
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
    const typesRequired = await this.documentService.enforceDocType(this.pieces);
    if (typesRequired) return;

    this.showProposableAgendaModal = true;
  });
}
