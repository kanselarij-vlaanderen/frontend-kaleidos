import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { trimText } from 'frontend-kaleidos/utils/trim-util';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';

export default class NewSubcaseForm extends Component {
  @service store;
  @service conceptStore;
  @service router;
  @service mandatees;

  @tracked filter = Object.freeze({
    type: 'subcase-name',
  });
  @tracked confidential = false;
  @tracked shortTitle;
  @tracked title;
  @tracked subcaseName;
  @tracked agendaItemTypes;
  @tracked agendaItemType;
  @tracked subcaseType;
  @tracked selectedShortcut;
  @tracked latestSubcase = null;
  @tracked isEditing = false;

  @tracked submitter;
  @tracked mandatees = [];

  @tracked selectedGovernmentFields = [];
  @tracked selectedGovernmentDomains = [];

  constructor() {
    super(...arguments);
    this.loadAgendaItemTypes.perform();
    this.loadTitleData.perform();
  }

  @action
  toggleIsEditing() {
    this.isEditing = !this.isEditing;
  }

  @action
  async selectSubcaseType(subcaseType) {
    this.subcaseType = subcaseType;
    this.subcaseName = subcaseType.label;
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
    this.agendaItemType = this.agendaItemTypes.find((type) => type.uri === CONSTANTS.AGENDA_ITEM_TYPES.NOTA);
  }

  @action
  selectSubcaseName(shortcut) {
    this.selectedShortcut = shortcut;
    this.subcaseName = shortcut.label;
  }

  get areLoadingTasksRunning() {
    return (
      this.loadAgendaItemTypes.isRunning ||
      this.loadLatestSubcase.isRunning ||
      this.loadTitleData.isRunning
    );
  }

  @task
  *loadTitleData() {
      yield this.loadLatestSubcase.perform();
      if (this.latestSubcase) {
        this.title = this.latestSubcase.title;
        this.shortTitle = this.latestSubcase.shortTitle;
        this.confidential = this.latestSubcase.confidential;
      } else {
        const _case = yield this.args.decisionmakingFlow.case;
        this.title = _case.title;
        this.shortTitle = _case.shortTitle;
        this.confidential = false;
      }
  }

  @task
  *loadLatestSubcase() {
      this.latestSubcase = yield this.store.queryOne('subcase', {
        filter: {
          'decisionmaking-flow': {
            ':id:': this.args.decisionmakingFlow.id,
          },
        },
        sort: '-created',
      });
  }

  @task
  *saveCase(fullCopy) {
    const now = new Date();
    let subcase = this.store.createRecord('subcase', {
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
    if (this.latestSubcase) {
      // Previous "versions" of this subcase exist
      piecesFromSubmissions = yield this.loadSubcasePieces(this.latestSubcase);
      yield this.copySubcaseProperties(
        subcase,
        this.latestSubcase,
        fullCopy,
        piecesFromSubmissions
      );
    }
    // We save here in order to set the belongsTo relation between submission-activity and subcase
    yield subcase.save();
    // reload the list of subcases on case, list is not updated automatically
    yield this.args.decisionmakingFlow?.hasMany('subcases').reload();

    if (this.latestSubcase && fullCopy) {
      yield this.copySubcaseSubmissions(subcase, piecesFromSubmissions);
    }

    const mandatees = yield subcase.mandatees;
    mandatees.clear();
    mandatees.pushObjects(this.mandatees);
    subcase.requestedBy = this.submitter;

    let newGovernmentAreas = this.selectedGovernmentDomains.concat(this.selectedGovernmentFields);
    const governmentAreas = yield subcase.governmentAreas;
    governmentAreas.clear();
    governmentAreas.pushObjects(newGovernmentAreas);
    yield subcase.save();

    this.router.transitionTo('cases.case.subcases.subcase', this.args.decisionmakingFlow.id, subcase.id);
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
    for (const submissionActivity of submissionActivities.toArray()) {
      let submissionPieces = await submissionActivity.pieces;
      submissionPieces = submissionPieces.toArray();
      pieces.push(...submissionPieces);
    }
    return pieces;
  }

  @action
  async copySubcaseProperties(subcase, latestSubcase, fullCopy, pieces) {
    const type = await subcase.type;
    const subcaseTypeWithoutMandatees = [
      CONSTANTS.SUBCASE_TYPES.BEKRACHTIGING,
    ].includes(type?.uri);
    // Everything to copy from latest subcase
    if (!subcaseTypeWithoutMandatees) {
      subcase.mandatees = await latestSubcase.mandatees;
      subcase.requestedBy = await latestSubcase.requestedBy;
    }
    if (fullCopy) {
      subcase.linkedPieces = await latestSubcase.linkedPieces;
      subcase.subcaseName = latestSubcase.subcaseName;
      subcase.agendaItemType = await latestSubcase.agendaItemType;
      subcase.confidential = latestSubcase.confidential;
    } else {
      subcase.linkedPieces = pieces;
    }
    subcase.governmentAreas = await latestSubcase.governmentAreas;
    return subcase;
  }

  @action
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
    this.mandatees = mandatees;
  }

  /** government areas */

  @action
  selectField(selectedField) {
    this.selectedGovernmentFields.pushObjects(selectedField);
  }

  @action
  deselectField(selectedField) {
    this.selectedGovernmentFields.removeObjects(selectedField);
  }

  @action
  selectDomain(selectedDomain) {
    this.selectedGovernmentDomains.pushObjects(selectedDomain);
  }

  @action
  deselectDomain(selectedDomain) {
    this.selectedGovernmentDomains.removeObjects(selectedDomain);
  }
}