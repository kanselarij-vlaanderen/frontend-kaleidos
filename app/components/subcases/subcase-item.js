import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';
import { inject as service } from '@ember/service';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';

export default class SubcaseItemSubcasesComponent extends Component {
  /**
   * @argument case
   * @argument subcase
   */

  @service store;
  @service intl;

  @tracked isShowingAllDocuments = false;
  @tracked hasDocumentsToShow = false;
  @tracked subcaseDocuments;
  @tracked requestedForMeeting;

  constructor() {
    super(...arguments);
    this.updateHasDocumentsToShow.perform();
    this.loadRelatedMeeting.perform();
  }

  get documentListSize() {
    return 20;
  }

  get limitedSubcaseDocuments() {
    if (this.isShowingAllDocuments) {
      return this.subcaseDocuments;
    }
    return this.subcaseDocuments.slice(0, this.documentListSize);
  }

  get enableShowMore() {
    return this.subcaseDocuments.length > this.documentListSize;
  }

  get nameToShow() {
    if (this.args.subcase.subcaseName) {
      return `${this.intl.t('in-function-of')} ${
        this.args.subcase.subcaseName
      }`;
    }
    if (this.args.subcase.shortTitle) {
      return this.args.subcase.shortTitle;
    }
    if (this.args.subcase.title) {
      return this.args.subcase.title;
    }
    return this.intl.t('subcase-without-title');
  }

  @task
  *updateHasDocumentsToShow() {
    const doc = yield this.store.queryOne('submission-activity', {
      'filter[subcase][:id:]': this.args.subcase.id,
      'filter[:has:pieces]': 'true',
    });
    this.hasDocumentsToShow = doc !== null;
  }

  @task
  *loadRelatedMeeting() {
    this.requestedForMeeting = yield this.args.subcase.requestedForMeeting;
  }

  @task
  *loadSubcaseDocuments() {
    // 2-step procees (submission-activity -> pieces). Querying pieces directly doesn't
    // work since the inverse isn't present in API config
    const submissionActivities = yield this.store.query('submission-activity', {
      'filter[subcase][:id:]': this.args.subcase.id,
      'page[size]': PAGE_SIZE.ACTIVITIES,
      include: 'pieces', // Make sure we have all pieces, unpaginated
    });

    const pieces = [];
    for (const submissionActivity of submissionActivities.toArray()) {
      let submissionPieces = yield submissionActivity.pieces;
      submissionPieces = submissionPieces.toArray();
      pieces.push(...submissionPieces);
    }

    this.subcaseDocuments = sortPieces(pieces);
  }

  @action
  toggleShowingAllDocuments() {
    this.isShowingAllDocuments = !this.isShowingAllDocuments;
  }
}
