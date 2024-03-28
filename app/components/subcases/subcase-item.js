import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
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
    const subcaseHasDocuments = yield this.store.queryOne('submission-activity', {
      'filter[subcase][:id:]': this.args.subcase.id,
      'filter[:has:pieces]': 'true',
    });
    this.hasDocumentsToShow = subcaseHasDocuments !== null;
    if (!this.hasDocumentsToShow) {
      this.documentsAreVisible = false;
      return;
    }
    // Additional failsafe check on document visibility. Strictly speaking this check
    // should not be necessary since documents are not propagated by Yggdrasil if they
    // should not be visible yet for a specific profile.
    // There is however a different situation when a subcase has been postponed.
    // In that case no documents should be showing (as the subcase in still progress)
    // but those from the first meeting are already propagated and are visible.
    yield this.loadRelatedMeeting.perform();
    this.decisionActivity = yield this.loadRelatedDecisionActivity.perform();
    const decisionActivityResultCode = yield this.decisionActivity
      ?.decisionResultCode;
    const { INGETROKKEN, UITGESTELD } = CONSTANTS.DECISION_RESULT_CODE_URIS;
    if (this.currentSession.may('view-documents-before-release')) {
      this.documentsAreVisible = true;
    } else if (
      !this.currentSession.may('view-postponed-and-retracted') &&
      [INGETROKKEN, UITGESTELD].includes(decisionActivityResultCode?.uri)
    ) {
      this.documentsAreVisible = false;
    } else {
      const documentPublicationActivity = yield this.latestMeeting
        ?.internalDocumentPublicationActivity;
      const documentPublicationStatus =
        yield documentPublicationActivity?.status;
      this.documentsAreVisible =
        documentPublicationStatus?.uri === CONSTANTS.RELEASE_STATUSES.RELEASED;
    }
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
    yield this.latestMeeting?.belongsTo('agenda').reload();
  }

  loadRelatedDecisionActivity = task(async () => {
    return await this.store.queryOne(
      'decision-activity',
      {
        'filter[treatment][agendaitems][agenda-activity][subcase][:id:]':
          this.args.subcase.id,
        sort: '-treatment.agendaitems.agenda-activity.start-date',
      }
    );
  });

  @task
  *loadSubcaseDocuments() {
    if (!this.documentsAreVisible) {
      return;
    }
    // proceed to get the documents
    const queryParams = {
      include: 'pieces', // Make sure we have all pieces, unpaginated
      'filter[subcase][:id:]': this.args.subcase.id,
    };
    // only get the documents on latest agendaActivity if applicable
    const agendaActivities = yield this.args.subcase.agendaActivities;
    const latestActivity = agendaActivities
      .slice()
      .sort((a1, a2) => a1.startDate - a2.startDate)
      .at(-1);
    if (latestActivity) {
      queryParams['filter[agenda-activity][:id:]'] = latestActivity.id;
    }
    // 2-step procees (submission-activity -> pieces). Querying pieces directly doesn't
    // work since the inverse isn't present in API config
    const submissionActivities = yield this.store.queryAll('submission-activity', queryParams);

    const pieces = [];
    for (const submissionActivity of submissionActivities.slice()) {
      let submissionPieces = yield submissionActivity.pieces;
      submissionPieces = submissionPieces.slice();
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
