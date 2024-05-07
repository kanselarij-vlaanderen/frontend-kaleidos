import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { trimText } from 'frontend-kaleidos/utils/trim-util';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';
import { TrackedArray } from 'tracked-built-ins';
import { dropTask, task, all } from 'ember-concurrency';
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
  }

  get areLoadingTasksRunning() {
    return this.loadAgendaItemTypes.isRunning || this.loadTitleData.isRunning;
  }

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

  @task
  *loadAgendaItemTypes() {
    this.agendaItemTypes = yield this.conceptStore.queryAllByConceptScheme(
      CONSTANTS.CONCEPT_SCHEMES.AGENDA_ITEM_TYPES
    );
    this.agendaItemType = this.agendaItemTypes.find(
      (type) => type.uri === CONSTANTS.AGENDA_ITEM_TYPES.NOTA
    );
  }

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

  @task
  *cancelForm() {
    yield this.deletePieces();
    this.router.transitionTo('cases.case.index');
  }

  @task
  *loadTitleData() {
    if (this.args.latestSubcase) {
      this.title = this.args.latestSubcase.title;
      this.shortTitle = this.args.latestSubcase.shortTitle;
      this.confidential = this.args.latestSubcase.confidential;
      addObjects(this.mandatees, (yield this.args.latestSubcase.mandatees));
      this.submitter = yield this.args.latestSubcase.requestedBy;
      addObjects(this.governmentAreas, (yield this.args.latestSubcase.governmentAreas));
    } else {
      const _case = yield this.args.decisionmakingFlow.case;
      this.title = _case.title;
      this.shortTitle = _case.shortTitle;
      this.confidential = false;
    }
  }

  @dropTask
  *createSubcase(
    fullCopy = false,
    meeting = null,
    isFormallyOk = false,
    privateComment = null
  ) {
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
      piecesFromSubmissions = yield this.loadSubcasePieces(
        this.args.latestSubcase
      );
      yield this.copySubcaseProperties(
        this.subcase,
        this.args.latestSubcase,
        fullCopy,
        piecesFromSubmissions
      );
    }
    // We save here in order to set the belongsTo relation between submission-activity and subcase
    yield this.subcase.save();
    // reload the list of subcases on case, list is not updated automatically
    yield this.args.decisionmakingFlow?.hasMany('subcases').reload();

    if (this.args.latestSubcase && fullCopy) {
      yield this.copySubcaseSubmissions(this.subcase, piecesFromSubmissions);
    }

    const mandatees = yield this.subcase.mandatees;
    mandatees.length = 0;
    addObjects(mandatees, this.mandatees);
    this.subcase.requestedBy = this.submitter;

    const newGovernmentAreas = [...this.selectedGovernmentFields, ...this.selectedGovernmentDomains]
    const governmentAreas = yield this.subcase.governmentAreas;
    governmentAreas.length = 0;
    addObjects(governmentAreas, newGovernmentAreas);
    yield this.subcase.save();

    if (this.pieces.length) {
      yield this.savePieces.perform();
    }

    if (meeting) {
      try {
        yield this.agendaService.putSubmissionOnAgenda(
          meeting,
          this.subcase,
          isFormallyOk,
          privateComment
        );
      } catch (error) {
        this.toaster.error(
          this.intl.t('error-while-submitting-subcase-on-meeting', { error: error.message }),
          this.intl.t('warning-title')
        );
      }
    }

    this.args.onCreateSubcase?.();
    this.router.transitionTo(
      'cases.case.subcases.subcase',
      this.args.decisionmakingFlow.id,
      this.subcase.id
    );
  }

  async loadSubcasePieces(subcase) {
    // 2-step procees (submission-activity -> pieces). Querying pieces directly doesn't
    // work since the inverse isn't present in API config
    const submissionActivities = await this.store.query('submission-activity', {
      'filter[subcase][:id:]': subcase.id,
      'page[size]': PAGE_SIZE.CASES,
      include: 'pieces', // Make sure we have all pieces, unpaginated
    });
    const pieces = [];
    for (const submissionActivity of submissionActivities.slice()) {
      let submissionPieces = await submissionActivity.pieces;
      submissionPieces = submissionPieces.slice();
      pieces.push(...submissionPieces);
    }
    return pieces;
  }

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
  addPiece(piece) {
    addObject(this.pieces, piece);
  }

  @task
  *savePieces() {
    this.piecesCreatedCounter = 0;
    const savePromises = this.pieces.map(async (piece) => {
      try {
        await this.savePiece.perform(piece);
      } catch (error) {
        await this.deletePiece(piece);
        throw error;
      }
    });
    yield all(savePromises);
    yield this.createSubmissionActivity.perform(this.pieces);
    this.pieces = new TrackedArray([]);
  }

  @task({ maxConcurrency: 5, enqueue: true })
  *savePiece(piece) {
    const documentContainer = yield piece.documentContainer;
    yield documentContainer.save();
    const defaultAccessLevel = yield this.store.findRecordByUri(
      'concept',
      this.subcase.confidential
        ? CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK
        : CONSTANTS.ACCESS_LEVELS.INTERN_REGERING
    );
    piece.accessLevel = defaultAccessLevel;
    piece.accessLevelLastModified = new Date();
    piece.name = piece.name.trim();
    yield piece.save();
    try {
      const sourceFile = yield piece.file;
      yield this.fileConversionService.convertSourceFile(sourceFile);
    } catch (error) {
      this.toaster.error(
        this.intl.t('error-convert-file', { message: error.message }),
        this.intl.t('warning-title')
      );
    }
    this.piecesCreatedCounter++;
  }

  @task
  *createSubmissionActivity(pieces) {
    let submissionActivity = this.store.createRecord('submission-activity', {
      startDate: new Date(),
      subcase: this.subcase,
      pieces,
    });

    submissionActivity = yield submissionActivity.save();
    return submissionActivity;
  }

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
}
