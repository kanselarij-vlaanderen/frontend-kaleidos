import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';
import { inject as service } from '@ember/service';
import { sortPieces } from 'fe-redpencil/utils/documents';

export default class SubcaseItemSubcasesComponent extends Component {
  @service store;

  @tracked isShowingDocuments = false;
  @tracked isShowingAllDocuments = false;
  @tracked hasDocumentsToShow = false;
  @tracked subcaseDocuments;

  constructor() {
    super(...arguments);
    this.updateHasDocumentsToShow.perform();
  }

  get documentListSize() {
    return 20;
  }

  get limitedSubcaseDocuments() {
    if (this.isShowingAllDocuments) {
      return this.subcaseDocuments;
    }
    return this.subcaseDocuments.slice(this.documentListSize);
  }

  get enableShowMore() {
    return this.subcaseDocuments.length > this.documentListSize;
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
  *loadSubcaseDocuments() {
    // 2-step procees (submission-activity -> pieces). Querying pieces directly doesn't
    // work since the inverse isn't present in API config
    const submissionActivities = yield this.store.query('submission-activity', {
      'filter[subcase][:id:]': this.args.subcase.id,
      'page[size]': 500,
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
  async toggleIsShowingDocuments() {
    await this.loadSubcaseDocuments.perform();
    this.isShowingDocuments = !this.isShowingDocuments;
  }

  @action
  toggleShowingAllDocuments() {
    this.isShowingAllDocuments = !this.isShowingAllDocuments;
  }
}
