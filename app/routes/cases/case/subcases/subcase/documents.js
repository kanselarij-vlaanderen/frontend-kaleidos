import Route from '@ember/routing/route';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';
import { inject as service } from '@ember/service';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
import VrLegacyDocumentName,
{ compareFunction as compareLegacyDocuments } from 'frontend-kaleidos/utils/vr-legacy-document-name';

export default class DocumentsSubcaseSubcasesRoute extends Route {
  @service store;
  @service currentSession;

  async model() {
    this.subcase = this.modelFor('cases.case.subcases.subcase');
    const queryParams = {
      page: {
        size: PAGE_SIZE.ACTIVITIES,
      },
      include: 'pieces,pieces.document-container', // Make sure we have all pieces, unpaginated
      'filter[subcase][:id:]': this.subcase.id,
    };
    // only get the documents on latest meeting if applicable
    const agendaActivities = await this.subcase.agendaActivities;
    const latestActivity = agendaActivities.sortBy('startDate')?.lastObject;
    if (latestActivity) {
      queryParams['filter[agenda-activity][:id:]'] = latestActivity.id;
    }
    // 2-step process (submission-activity -> pieces). Querying pieces directly doesn't
    // work since the inverse isn't present in API config
    const submissionActivities = await this.store.query('submission-activity', queryParams);

    const pieces = [];
    for (const submissionActivity of submissionActivities.toArray()) {
      let submissionPieces = await submissionActivity.pieces;
      submissionPieces = submissionPieces.toArray();
      pieces.push(...submissionPieces);
    }

    let sortedPieces;
    this.latestMeeting = await this.store.queryOne('meeting', {
      'filter[agendas][agendaitems][agenda-activity][subcase][:id:]': this.subcase.id,
      sort: '-planned-start',
    });
    if (this.latestMeeting?.isPreKaleidos) {
      sortedPieces = sortPieces(pieces, VrLegacyDocumentName, compareLegacyDocuments);
    } else {
      sortedPieces = sortPieces(pieces);
    }

    return {
      pieces: sortedPieces,
      // linkedPieces: this.modelFor('cases.case.subcases.subcase').get('linkedPieces')
    };
  }

  async afterModel() {
    this.defaultAccessLevel = await this.store.findRecordByUri(
      'concept',
      this.subcase.confidential
        ? CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK
        : CONSTANTS.ACCESS_LEVELS.INTERN_REGERING
    );

    // Additional failsafe check on document visibility. Strictly speaking this check
    // is not necessary since documents are not propagated by Yggdrasil if they
    // should not be visible yet for a specific profile.
    if (this.currentSession.isOverheid) {
      const documentPublicationActivity = await this.latestMeeting?.internalDocumentPublicationActivity;
      if (documentPublicationActivity) {
        const documentPublicationStatus = await documentPublicationActivity?.status;
        this.documentsAreVisible = documentPublicationStatus.uri === CONSTANTS.RELEASE_STATUSES.RELEASED;
      }
    } else {
      this.documentsAreVisible = true;
    }
    const decisionmakingFlow = this.modelFor('cases.case');
    this.case = await decisionmakingFlow.case;
  }

  setupController(controller) {
    super.setupController(...arguments);
    const subcase = this.modelFor('cases.case.subcases.subcase');
    controller.subcase = subcase;
    controller.case = this.case;
    controller.documentsAreVisible = this.documentsAreVisible;
    controller.defaultAccessLevel = this.defaultAccessLevel;
  }
}
