import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { trimText } from 'frontend-kaleidos/utils/trim-util';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

export default class CasesNewSubcase extends Component {
  @service store;

  @tracked filter = Object.freeze({
    type: 'subcase-name',
  });
  @tracked agendaItemTypes;
  @tracked title;
  @tracked shortTitle;
  @tracked confidential;

  @tracked agendaItemType;
  @tracked selectedShortcut;
  @tracked subcaseName;
  @tracked type;
  @tracked latestSubcase;
  @tracked isEditing = false;

  constructor() {
    super(...arguments);
    this.loadAgendaItemTypes.perform();
    this.loadTitleData.perform();
  }

  @task
  *loadAgendaItemTypes() {
    this.agendaItemTypes = yield this.store.query('concept', {
      sort: '-label',
      filter: {
        'concept-schemes': {
          ':uri:': CONSTANTS.CONCEPT_SCHEMES.AGENDA_ITEM_TYPES,
        }
      },
      page: {
        size: PAGE_SIZE.CODE_LISTS,
      },
    });
    this.agendaItemType = yield this.store.findRecordByUri('concept', CONSTANTS.AGENDA_ITEM_TYPES.NOTA);
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
  *loadTitleData() {
    yield this.loadLatestSubcase.perform();
    if (this.latestSubcase) {
      this.title = this.latestSubcase.title;
      this.shortTitle = this.latestSubcase.shortTitle;
      this.confidential = this.latestSubcase.confidential;
    } else {
      this.title = this.args.case.title;
      this.shortTitle = this.args.case.shortTitle;
      this.confidential = false;
    }
  }

  get areLoadingTasksRunning() {
    return (
      this.loadAgendaItemTypes.isRunning ||
      this.loadLatestSubcase.isRunning ||
      this.loadTitleData.isRunning
    );
  }

  get areSavingTasksRunning() {
    return this.copyFullSubcase.isRunning || this.saveSubcase.isRunning;
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
  async createSubcase(fullCopy) {
    const date = new Date();

    const subcase = this.store.createRecord('subcase', {
      type: this.type,
      shortTitle: trimText(this.shortTitle),
      title: trimText(this.title),
      confidential: this.confidential,
      agendaItemType: this.agendaItemType,
      decisionmakingFlow: this.args.decisionmakingFlow,
      created: date,
      modified: date,
      isArchived: false,
      subcaseName: this.subcaseName,
      agendaActivities: [],
    });

    let piecesFromSubmissions;
    if (this.latestSubcase) {
      // Previous "versions" of this subcase exist
      piecesFromSubmissions = await this.loadSubcasePieces(this.latestSubcase);
      await this.copySubcaseProperties(
        subcase,
        this.latestSubcase,
        fullCopy,
        piecesFromSubmissions
      );
    }
    // We save here in order to set the belongsTo relation between submission-activity and subcase
    await subcase.save();
    // reload the list of subcases on case, list is not updated automatically
    await this.args.decisionmakingFlow.hasMany('subcases').reload();

    if (this.latestSubcase && fullCopy) {
      await this.copySubcaseSubmissions(subcase, piecesFromSubmissions);
    }
    return;
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

  @task
  *copyFullSubcase() {
    yield this.createSubcase(true);
    this.args.onCreate();
  }

  @task
  *saveSubcase() {
    yield this.createSubcase(false);
    this.args.onCreate();
  }

  @action
  selectType(type) {
    this.type = type;
  }

  @action
  selectSubcaseName(shortcut) {
    this.selectedShortcut = shortcut;
    this.subcaseName = shortcut.label;
  }

  @action
  selectAgendaItemType(event) {
    const id = event.target.value;
    this.agendaItemType = this.store.peekRecord('concept', id);
  }

  @action
  toggleIsEditing() {
    this.isEditing = !this.isEditing;
  }
}
