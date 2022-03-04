import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { trimText } from 'frontend-kaleidos/utils/trim-util';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { action } from '@ember/object';

export default class CasesNewSubcase extends Component {
  @service store;

  @tracked filter = Object.freeze({
    type: 'subcase-name',
  });
  @tracked caseTypes;
  @tracked title;
  @tracked shortTitle;
  @tracked confidential;

  @tracked showAsRemark;
  @tracked selectedShortcut;
  @tracked subcaseName;
  @tracked type;
  @tracked latestSubcase;
  @tracked isEditing = false;

  constructor() {
    super(...arguments);
    this.loadCaseTypes.perform();
    this.loadTitleData.perform();
  }

  @task
  *loadCaseTypes() {
    this.caseTypes = yield this.store.query('case-type', {
      sort: '-label',
      filter: {
        deprecated: false,
      },
      page: {
        size: PAGE_SIZE.CODE_LISTS,
      },
    });
  }

  @task
  *loadLatestSubcase() {
    this.latestSubcase = yield this.store.queryOne('subcase', {
      filter: {
        case: {
          ':id:': this.args.case.id,
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
      this.loadCaseTypes.isRunning ||
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
      showAsRemark: this.showAsRemark || false,
      case: this.args.case,
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

    if (this.latestSubcase && fullCopy) {
      await this.copySubcaseSubmissions(subcase, piecesFromSubmissions);
    }
    return;
  }

  @action
  async copySubcaseProperties(subcase, latestSubcase, fullCopy, pieces) {
    // Everything to copy from latest subcase
    subcase.mandatees = await latestSubcase.mandatees;
    subcase.requestedBy = await latestSubcase.requestedBy;

    if (fullCopy) {
      subcase.linkedPieces = await latestSubcase.linkedPieces;
      subcase.subcaseName = latestSubcase.subcaseName;
      subcase.showAsRemark = latestSubcase.showAsRemark;
      subcase.confidential = latestSubcase.confidential;
    } else {
      subcase.linkedPieces = pieces;
    }
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
  typeChanged(event) {
    const id = event.target.value;
    const type = this.store.peekRecord('case-type', id);
    this.showAsRemark = type.get('uri') === CONSTANTS.CASE_TYPES.REMARK;
  }

  @action
  toggleIsEditing() {
    this.isEditing = !this.isEditing;
  }
}
