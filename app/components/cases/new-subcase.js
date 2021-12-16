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
    return (
      this.copyFullSubcase.isRunning ||
      this.saveSubcase.isRunning
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

    let subcase = await this.store.createRecord('subcase', {
      type: this.type,
      shortTitle: trimText(this.shortTitle),
      title: trimText(this.title),
      confidential: this.confidential,
      showAsRemark: this.showAsRemark || false,
      case: this.args.case,
      created: date,
      modified: date,
      isArchived: false,
      agendaActivities: [],
    });
    subcase.subcaseName = this.subcaseName;

    if (this.latestSubcase) {
      // Previous "versions" of this subcase exist
      subcase = await this.copySubcaseProperties(
        subcase,
        this.latestSubcase,
        fullCopy
      );
    }
    return subcase;
  }

  @action
  async copySubcaseProperties(subcase, latestSubcase, fullCopy) {
    const pieces = await this.loadSubcasePieces(latestSubcase);
    if (fullCopy) {
      subcase.linkedPieces = await latestSubcase.linkedPieces;
      subcase.subcaseName = latestSubcase.subcaseName;
      subcase.accessLevel = await latestSubcase.accessLevel;
      subcase.showAsRemark = latestSubcase.showAsRemark;
      subcase.confidential = latestSubcase.confidential;
      const submissionActivity = this.store.createRecord(
        'submission-activity',
        {
          startDate: new Date(),
          pieces: pieces,
        }
      );
      await submissionActivity.save();
      subcase.submissionActivities.pushObject(submissionActivity);
    } else {
      subcase.linkedPieces = pieces;
    }
    // Everything to copy from latest subcase
    subcase.mandatees = await latestSubcase.mandatees;
    subcase.requestedBy = await latestSubcase.requestedBy;
    return subcase;
  }

  @task
  *copyFullSubcase() {
    const subcase = yield this.createSubcase(true);
    yield this.args.onSave(subcase);
  }

  @task
  *saveSubcase() {
    const subcase = yield this.createSubcase(false);
    yield this.args.onSave(subcase);
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
