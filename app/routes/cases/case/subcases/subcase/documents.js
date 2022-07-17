import Route from '@ember/routing/route';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
import VrLegacyDocumentName,
{ compareFunction as compareLegacyDocuments } from 'frontend-kaleidos/utils/vr-legacy-document-name';

export default class DocumentsSubcaseSubcasesRoute extends Route {
  @service store;

  async model() {
    const subcase = this.modelFor('cases.case.subcases.subcase');
    // 2-step procees (submission-activity -> pieces). Querying pieces directly doesn't
    // work since the inverse isn't present in API config
    const submissionActivities = await this.store.query('submission-activity', {
      'filter[subcase][:id:]': subcase.id,
      'page[size]': PAGE_SIZE.ACTIVITIES,
      include: 'pieces,pieces.document-container', // Make sure we have all pieces, unpaginated
    });

    const pieces = [];
    for (const submissionActivity of submissionActivities.toArray()) {
      let submissionPieces = await submissionActivity.pieces;
      submissionPieces = submissionPieces.toArray();
      pieces.push(...submissionPieces);
    }

    let sortedPieces;
    const meeting = await subcase.requestedForMeeting;
    if (meeting?.isPreKaleidos) {
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
    this.defaultAccessLevel = await this.store.findRecordByUri('concept', CONSTANTS.ACCESS_LEVELS.INTERN_REGERING);
  }

  setupController(controller) {
    super.setupController(...arguments);
    const subcase = this.modelFor('cases.case.subcases.subcase');
    controller.subcase = subcase;
    const _case = this.modelFor('cases.case');
    controller.case = _case;
    controller.defaultAccessLevel = this.defaultAccessLevel;
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
