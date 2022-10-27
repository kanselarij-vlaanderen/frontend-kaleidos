import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';
import VrLegacyDocumentName,
{ compareFunction as compareLegacyDocuments } from 'frontend-kaleidos/utils/vr-legacy-document-name';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class SubcaseItemSubcasesComponent extends Component {
  /**
   * @argument case
   * @argument subcase
   */

  @service store;
  @service intl;
  @service subcasesService;
  @service subcaseIsApproved;
  @service currentSession;

  @tracked isShowingAllDocuments = false;
  @tracked hasDocumentsToShow = false;
  @tracked subcaseDocuments;
  @tracked phases;
  @tracked approved; // or acknowledged
  @tracked documentsAreVisible = false;

  constructor() {
    super(...arguments);
    this.updateHasDocumentsToShow.perform();
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
    yield this.loadRelatedMeeting.perform();
    // Additional failsafe check on document visibility. Strictly speaking this check
    // should not be necessary since documents are not propagated by Yggdrasil if they
    // should not be visible yet for a specific profile.
    // There is however a different situation when a subcase has been postponed.
    // In that case no documents should be showing (as the subcase in still progress)
    // but those from the first meeting are already propagated and are visible. 
    if (!this.currentSession.may('view-documents-before-release')) {
      const documentPublicationActivity = yield this.latestMeeting?.internalDocumentPublicationActivity;
      const documentPublicationStatus = yield documentPublicationActivity?.status;
      if (documentPublicationStatus?.uri !== CONSTANTS.RELEASE_STATUSES.RELEASED) {
        this.hasDocumentsToShow = false;
      }
    };
  }

  @task
  *loadRelatedMeeting() {
    const latestAgendaitem = yield this.store.queryOne('agendaitem', {
      'filter[agenda-activity][subcase][:id:]': this.args.subcase.id,
      'filter[:has-no:next-version]': 't',
      sort: '-created',
    });
    const agenda = yield latestAgendaitem?.agenda;
    this.latestMeeting = yield agenda?.createdFor;
  }

  @task
  *loadSubcaseDocuments() {
    // proceed to get the documents
    const queryParams = {
      page: {
        size: PAGE_SIZE.ACTIVITIES,
      },
      include: 'pieces', // Make sure we have all pieces, unpaginated
      'filter[subcase][:id:]': this.args.subcase.id,
    };
    // only get the documents on latest agendaActivity if applicable
    const agendaActivities = yield this.args.subcase.agendaActivities;
    const latestActivity = agendaActivities.sortBy('startDate')?.lastObject;
    if (latestActivity) {
      queryParams['filter[agenda-activity][:id:]'] = latestActivity.id;
    }
    // 2-step procees (submission-activity -> pieces). Querying pieces directly doesn't
    // work since the inverse isn't present in API config
    const submissionActivities = yield this.store.query('submission-activity', queryParams);

    const pieces = [];
    for (const submissionActivity of submissionActivities.toArray()) {
      let submissionPieces = yield submissionActivity.pieces;
      submissionPieces = submissionPieces.toArray();
      pieces.push(...submissionPieces);
    }

    if (this.latestMeeting?.isPreKaleidos) {
      this.subcaseDocuments = sortPieces(pieces, VrLegacyDocumentName, compareLegacyDocuments);
    } else {
      this.subcaseDocuments = sortPieces(pieces);
    }
  }

  @task
  *loadSubcaseIsApproved() {
    this.approved = yield this.subcaseIsApproved.isApproved(this.args.subcase);
  }

  @action
  toggleShowingAllDocuments() {
    this.isShowingAllDocuments = !this.isShowingAllDocuments;
  }
}
