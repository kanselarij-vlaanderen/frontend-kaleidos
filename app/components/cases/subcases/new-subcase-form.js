import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { trimText, cleanPasteInputForTextarea } from 'frontend-kaleidos/utils/trim-util';
import { TrackedArray } from 'tracked-built-ins';
import { task, all } from 'ember-concurrency';
import {
  addObject,
  addObjects,
  removeObject,
  removeObjects,
} from 'frontend-kaleidos/utils/array-helpers';

/**
 * @param decisionmakingFlow
 * @param latestSubcase
 */
export default class NewSubcaseForm extends Component {
  @service store;
  @service conceptStore;
  @service router;
  @service mandatees;
  @service fileConversionService;
  @service toaster;
  @service agendaService;
  @service plausible;
  @service intl;
  @service documentService;
  @service subcaseService;

  @tracked filter = Object.freeze({
    type: 'subcase-name',
  });
  @tracked subcase;
  @tracked confidential = false;
  @tracked shortTitle;
  @tracked title;
  @tracked subcaseName;
  @tracked agendaItemTypes;
  @tracked agendaItemType;
  @tracked subcaseType;
  @tracked selectedShortcut;
  @tracked isEditing = false;
  @tracked isSubcaseTypeWithoutMandatees = false;

  @tracked submitter;
  @tracked mandatees = new TrackedArray([]);

  @tracked governmentAreas = new TrackedArray([]);
  @tracked selectedGovernmentFields = new TrackedArray([]);
  @tracked selectedGovernmentDomains = new TrackedArray([]);

  @tracked isUploadingFiles;
  @tracked pieces = new TrackedArray([]);
  @tracked piecesCreatedCounter = 0;

  @tracked showProposableAgendaModal = false;

  constructor() {
    super(...arguments);
    this.loadAgendaItemTypes.perform();
    this.loadTitleData.perform();
    this.loadDefaultSubcaseType.perform();
  }

  get areLoadingTasksRunning() {
    return (
      this.loadAgendaItemTypes.isRunning ||
      this.loadTitleData.isRunning ||
      this.loadDefaultSubcaseType.isRunning
    );
  }

  get sortedPieces() {
    return this.pieces.slice().sort((p1, p2) => {
      const d1 = p1.belongsTo('documentContainer').value();
      const d2 = p2.belongsTo('documentContainer').value();

      return d1?.position - d2?.position || p1.created - p2.created;
    });
  }

  loadDefaultSubcaseType = task(async () => {
    this.subcaseType = await this.store.findRecordByUri(
      'subcase-type',
      CONSTANTS.SUBCASE_TYPES.DEFINITIEVE_GOEDKEURING
    );
  });

  @action
  async selectSubcaseType(subcaseType) {
    this.subcaseType = subcaseType;
    this.checkSubcaseType();
  }

  @action
  checkSubcaseType() {
    // We need to clear mandatees if they have been selected with this type of subcase
    this.isSubcaseTypeWithoutMandatees = [
      CONSTANTS.SUBCASE_TYPES.BEKRACHTIGING,
    ].includes(this.subcaseType?.uri);
    if (this.isSubcaseTypeWithoutMandatees) {
      this.mandatees.length = 0;
      this.submitter = null;
    }
  }

  @action
  onChangeAgendaItemType(selectedAgendaItemType) {
    this.agendaItemType = selectedAgendaItemType;
  }

  loadAgendaItemTypes = task(async () => {
    this.agendaItemTypes = await this.conceptStore.queryAllByConceptScheme(
      CONSTANTS.CONCEPT_SCHEMES.AGENDA_ITEM_TYPES
    );
    this.agendaItemType = this.agendaItemTypes.find(
      (type) => type.uri === CONSTANTS.AGENDA_ITEM_TYPES.NOTA
    );
  });

  @action
  selectSubcaseName(shortcut) {
    this.selectedShortcut = shortcut;
    this.subcaseName = shortcut.label;
  }

  @action
  clearSubcaseName() {
    this.selectedShortcut = null;
    this.subcaseName = null;
  }

  @action
  copySubcase() {
    this.plausible.trackEventWithRole('Kopieer voorgaande procedurestap');
    this.createSubcase.perform(true);
  }

  cancelForm = task(async () => {
    await this.deletePieces();
    this.router.transitionTo('cases.case.index');
  });

  loadTitleData = task(async () => {
    if (this.args.latestSubcase) {
      this.title = this.args.latestSubcase.title;
      this.shortTitle = this.args.latestSubcase.shortTitle;
      this.confidential = this.args.latestSubcase.confidential;
      addObjects(this.mandatees, (await this.args.latestSubcase.mandatees));
      this.submitter = await this.args.latestSubcase.requestedBy;
      addObjects(this.governmentAreas, (await this.args.latestSubcase.governmentAreas));
    } else {
      const _case = await this.args.decisionmakingFlow.case;
      this.title = _case.title;
      this.shortTitle = _case.shortTitle;
      this.confidential = false;
    }
  });

  createSubcase = task({drop: true}, async (
    fullCopy = false,
    meeting = null,
    formallyStatusUri,
    privateComment = null
  ) => {
    this.showProposableAgendaModal = false;
    const now = new Date();
    this.subcase = this.store.createRecord('subcase', {
      type: this.subcaseType,
      shortTitle: trimText(this.shortTitle),
      title: trimText(this.title),
      confidential: this.confidential,
      agendaItemType: this.agendaItemType,
      decisionmakingFlow: this.args.decisionmakingFlow,
      created: now,
      modified: now,
      subcaseName: this.subcaseName,
      agendaActivities: [],
    });

    let piecesFromSubmissions;
    if (this.args.latestSubcase) {
      // Previous "versions" of this subcase exist
      piecesFromSubmissions = await this.subcaseService.loadSubcasePieces(
        this.args.latestSubcase
      );
      await this.copySubcaseProperties(
        this.subcase,
        this.args.latestSubcase,
        fullCopy,
        piecesFromSubmissions
      );
    }
    // We save here in order to set the belongsTo relation between submission-activity and subcase
    await this.subcase.save();
    // reload the list of subcases on case, list is not updated automatically
    await this.args.decisionmakingFlow?.hasMany('subcases').reload();

    if (this.args.latestSubcase && fullCopy) {
      await this.copySubcaseSubmissions(this.subcase, piecesFromSubmissions);
    }

    const mandatees = await this.subcase.mandatees;
    mandatees.length = 0;
    addObjects(mandatees, this.mandatees);
    this.subcase.requestedBy = this.submitter;

    const newGovernmentAreas = [...this.selectedGovernmentFields, ...this.selectedGovernmentDomains]
    const governmentAreas = await this.subcase.governmentAreas;
    governmentAreas.length = 0;
    addObjects(governmentAreas, newGovernmentAreas);
    await this.subcase.save();

    if (this.pieces.length) {
      await this.savePieces.perform();
    }
    if (meeting) {
      try {
        await this.agendaService.putSubmissionOnAgenda(
          meeting,
          this.subcase,
          formallyStatusUri,
          privateComment
        );
      } catch (error) {
        this.toaster.error(
          this.intl.t('error-while-submitting-subcase-on-meeting', { error: error.message }),
          this.intl.t('warning-title')
        );
      }
    } else {
      await this.agendaService.createInternalReview(this.subcase, null, privateComment);
    }

    this.args.onCreateSubcase?.();
    this.router.transitionTo(
      'cases.case.subcases.subcase',
      this.args.decisionmakingFlow.id,
      this.subcase.id
    );
  });

  @action
  async copySubcaseProperties(subcase, latestSubcase, fullCopy, pieces) {
    // Everything to copy from latest subcase
    // we have preloaded some data already in local variables, less properties to copy
    if (fullCopy) {
      subcase.linkedPieces = await latestSubcase.linkedPieces;
      subcase.subcaseName = latestSubcase.subcaseName;
      subcase.agendaItemType = await latestSubcase.agendaItemType;
      subcase.confidential = latestSubcase.confidential;
    } else {
      subcase.linkedPieces = pieces;
    }
    return;
  }

  async copySubcaseSubmissions(subcase, pieces) {
    const submissionActivity = this.store.createRecord('submission-activity', {
      startDate: new Date(),
      pieces: pieces,
      subcase,
    });
    await submissionActivity.save();
    return;
  }

  @action
  transitionBack() {
    if (history.length > 1) {
      history.back();
    }
  }

  /** mandatee selector */

  @action
  setSubmitter(submitter) {
    this.submitter = submitter;
  }

  @action
  setMandatees(mandatees) {
    if (mandatees?.length) {
      this.mandatees = mandatees;
    } else {
      this.mandatees.clear();
      this.submitter = null;
    }
  }

  /** government areas */

  @action
  selectField(selectedField) {
    addObjects(this.selectedGovernmentFields, selectedField);
  }

  @action
  deselectField(selectedField) {
    removeObjects(this.selectedGovernmentFields, selectedField);
  }

  @action
  selectDomain(selectedDomain) {
    addObjects(this.selectedGovernmentDomains, selectedDomain);
  }

  @action
  deselectDomain(selectedDomain) {
    removeObjects(this.selectedGovernmentDomains, selectedDomain);
  }

  /** document upload */

  @action
  handleFileUploadQueueUpdates({ uploadIsRunning, uploadIsCompleted}) {
    this.isUploadingFiles = uploadIsRunning && !uploadIsCompleted;
  }

  @action
  async addPiece(piece) {
    // update accessLevel based on confidentiality
    const pieceAccessLevel = await piece.accessLevel;
    if (pieceAccessLevel?.uri != CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK) {      
      const defaultAccessLevel = await this.store.findRecordByUri(
        'concept',
        this.confidential
          ? CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK
          : CONSTANTS.ACCESS_LEVELS.INTERN_REGERING
      );
      piece.accessLevel = defaultAccessLevel;
    }

    addObject(this.pieces, piece);
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
    await all(savePromises);
    await this.createSubmissionActivity.perform(this.pieces);
    this.pieces = new TrackedArray([]);
  });

  savePiece = task(
    { maxConcurrency: 5, enqueue: true },
    async (piece, index) => {
      const documentContainer = await piece.documentContainer;
      documentContainer.position = index + 1;
      await documentContainer.save();
      // at this point in time, the piece already has an accessLevel
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
    }
  );

  createSubmissionActivity = task(async (pieces) => {
    let submissionActivity = this.store.createRecord('submission-activity', {
      startDate: new Date(),
      subcase: this.subcase,
      pieces,
    });

    submissionActivity = await submissionActivity.save();
    return submissionActivity;
  });

  @action
  async deletePieces() {
    const savePromises = this.pieces.map(async (piece) => {
      await this.deletePiece(piece);
    });
    await all(savePromises);
    this.pieces = new TrackedArray([]);
  }

  @action
  async deletePiece(piece) {
    const file = await piece.file;
    await file?.destroyRecord();
    removeObject(this.pieces, piece);
    const documentContainer = await piece?.documentContainer;
    await documentContainer?.destroyRecord();
    await piece?.destroyRecord();
  }

  openProposableAgendaModal = task(async () => {
    const typesRequired = await this.documentService.enforceDocType(this.pieces);
    if (typesRequired) return;

    this.showProposableAgendaModal = true;
  });

  pasteIntoShortTitle = (pasteEvent) => {
    this.shortTitle = cleanPasteInputForTextarea(pasteEvent, 'short-title-subcase', this.shortTitle);
  }

  pasteIntoTitle = (pasteEvent) => {
    this.title = cleanPasteInputForTextarea(pasteEvent, 'title-subcase', this.title);
  }
}
