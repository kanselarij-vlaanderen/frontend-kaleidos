import Route from '@ember/routing/route';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';
import { action } from '@ember/object';
import { sortPieces } from 'frontend-kaleidos/utils/documents';

export default class DocumentsSubcaseSubcasesRoute extends Route {
  async model() {
    const subcase = this.modelFor('cases.case.subcases.subcase');
    // 2-step procees (submission-activity -> pieces). Querying pieces directly doesn't
    // work since the inverse isn't present in API config
    const submissionActivities = await this.store.query('submission-activity', {
      'filter[subcase][:id:]': subcase.id,
      'page[size]': PAGE_SIZE.ACTIVITIES,
      include: 'pieces', // Make sure we have all pieces, unpaginated
    });

    const pieces = [];
    for (const submissionActivity of submissionActivities.toArray()) {
      let submissionPieces = await submissionActivity.pieces;
      submissionPieces = submissionPieces.toArray();
      pieces.push(...submissionPieces);
    }

    const sortedPieces = sortPieces(pieces);
    return {
      pieces: sortedPieces,
      // linkedPieces: this.modelFor('cases.case.subcases.subcase').get('linkedPieces')
    };
  }

  async afterModel() {
    this.defaultAccessLevel = await this.store.findRecordByUri('access-level', CONSTANTS.ACCESS_LEVELS.INTERN_REGERING);
  }

  setupController(controller) {
    super.setupController(...arguments);
    const subcase = this.modelFor('cases.case.subcases.subcase');
    controller.set('subcase', subcase);
    const _case = this.modelFor('cases.case');
    controller.set('case', _case);
    controller.set('defaultAccessLevel', this.defaultAccessLevel);
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
