import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import VrLegacyDocumentName,
{ compareFunction as compareLegacyDocuments } from 'frontend-kaleidos/utils/vr-legacy-document-name';

export default class SubcaseItemSubcasesComponent extends Component {
  /**
   * @argument case
   * @argument subcase
   */

  @service store;
  @service intl;
  @service subcasesService;

  @tracked isShowingAllDocuments = false;
  @tracked hasDocumentsToShow = false;
  @tracked subcaseDocuments;
  @tracked phases;
  @tracked approved;

  constructor() {
    super(...arguments);
    this.updateHasDocumentsToShow.perform();
    this.loadRelatedMeeting.perform();
    this.loadSubcasePhases.perform();
    this.loadSubcaseIsApproved.perform();
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
      const subcaseName = this.args.subcase.subcaseName;
      const formattedSubcaseName =
        subcaseName.substring(0, 1).toLowerCase() +
        subcaseName.substring(1, subcaseName.length);
      return `${this.intl.t('in-function-of')} ${formattedSubcaseName}`;
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
    yield this.args.subcase.requestedForMeeting;
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

    const meeting = yield this.args.subcase?.requestedForMeeting;
    if (meeting?.isPreKaleidos) {
      this.subcaseDocuments = sortPieces(pieces, VrLegacyDocumentName, compareLegacyDocuments);
    } else {
      this.subcaseDocuments = sortPieces(pieces);
    }
  }

  @task
  *loadSubcasePhases() {
    this.phases = yield this.subcasesService.getSubcasePhases(
      this.args.subcase
    );
  }

  @task
  *loadSubcaseIsApproved() {
    const meeting = yield this.args.subcase.requestedForMeeting;
    if (meeting?.isFinal) {
      const approvedDecisionResultCode = yield this.store.findRecordByUri(
        'concept',
        CONSTANTS.DECISION_RESULT_CODE_URIS.GOEDGEKEURD
      );
      const acknowledgedDecisionResultCode = yield this.store.findRecordByUri(
        'concept',
        CONSTANTS.DECISION_RESULT_CODE_URIS.KENNISNAME
      );
      this.approved = !!(yield this.store.queryOne('decision-activity', {
        'filter[subcase][id]': this.args.subcase.id,
        'filter[decision-result-code][:id:]': [
          approvedDecisionResultCode.id,
          acknowledgedDecisionResultCode.id,
        ].join(','),
      }));
    } else {
      this.approved = false;
    }
  }

  @action
  toggleShowingAllDocuments() {
    this.isShowingAllDocuments = !this.isShowingAllDocuments;
  }
}
