import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task, dropTask } from 'ember-concurrency';
import { trimText } from 'frontend-kaleidos/utils/trim-util';
import {
  addObject,
  addObjects,
  removeObject,
  removeObjects,
} from 'frontend-kaleidos/utils/array-helpers';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class CasesNewSubmissionComponent extends Component {
  @service agendaService;
  @service conceptStore;
  @service router;
  @service store;
  @service toaster
  @service fileConversionService;
  @service intl;

  @tracked selectedDecisionmakingFlow
  @tracked decisionmakingFlowTitle;

  @tracked agendaItemType;
  @tracked confidential;
  @tracked shortTitle;

  @tracked type;

  @tracked notificationAddresses = ["secretarie@vlaanderen.be"];
  @tracked notificationMessage;
  @tracked CCAddresses;
  @tracked CCMessage;

  @tracked showAgendaModal = false;
  @tracked hasAgenda = false;

  @tracked submitter;
  @tracked mandatees;

  @tracked governmentAreas = [];
  @tracked selectedGovernmentDomains = [];
  @tracked selectedGovernmentFields = [];
  @tracked pieces = [];

  @tracked showProposableAgendaModal = false;

  constructor() {
    super(...arguments);

    this.selectedDecisionmakingFlow = this.args.decisionmakingFlow;
  }

  get sortedPieces() {
    return this.pieces.slice().sort((p1, p2) => {
      const d1 = p1.belongsTo('documentContainer').value();
      const d2 = p2.belongsTo('documentContainer').value();

      return d1?.position - d2?.position || p1.created - p2.created;
    });
  }

  selectField = (selectedField) => {
    addObjects(this.selectedGovernmentFields, selectedField);
  }

  deselectField = (selectedField) => {
    removeObjects(this.selectedGovernmentFields, selectedField);
  }

  selectDomain = (selectedDomain) => {
    addObjects(this.selectedGovernmentDomains, selectedDomain);
  }

  deselectDomain = (selectedDomain) => {
    removeObjects(this.selectedGovernmentDomains, selectedDomain);
  }

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

  createSubmission = dropTask(async (meeting, comment) => {
    const now = new Date();

    await this.savePieces.perform();

    const submitted = await this.store.findRecordByUri('concept', CONSTANTS.SUBMISSION_STATUSES.INGEDIEND);

    this.submission = this.store.createRecord('submission', {
      created: now,
      modified: now,
      shortTitle: trimText(this.shortTitle),
      title: trimText(this.decisionmakingFlowTitle),
      confidential: this.confidential,
      type: this.type,
      agendaItemType: this.agendaItemType,
      decisionmakingFlow: this.selectedDecisionmakingFlow,
      approvedBy: this.notificationAddresses,
      approvalComment: trimText(this.notificationMessage),
      notified: this.CCAddresses,
      notificationComment: trimText(this.CCMessage),
      mandatees: this.mandatees ?? [],
      requestedBy: this.submitter,
      governmentAreas: [...this.selectedGovernmentFields, ...this.selectedGovernmentDomains],
      status: submitted,
    });

    await this.submission.save();

    // Create submission change
    const submissionStatusChange = this.store.createRecord('submission-status-change-activity', {
      startedAt: now,
      comment,
      submission: this.submission,
      status: submitted,
    });
    await submissionStatusChange.save();

    if (meeting) {
      try {
        await this.agendaService.putDraftSubmissionOnAgenda(
          meeting,
          this.submission,
        );
        this.router.transitionTo('cases');
      } catch (error) {
        this.toaster.error(
          this.intl.t('error-while-submitting-subcase-on-meeting', { error: error.message }),
          this.intl.t('warning-title')
        );
      }
    }
  })

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
  })

  savePiece = task({ maxConcurrency: 5, enqueue: true }, async (piece, index) => {
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
  })
}
