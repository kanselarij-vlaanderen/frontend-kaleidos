import Route from '@ember/routing/route';
import config from 'fe-redpencil/utils/config';
import { action } from '@ember/object';
import { sortPieces } from 'fe-redpencil/utils/documents';

export default class DocumentsSubcaseSubcasesRoute extends Route {
  async model() {
    const subcase = this.modelFor('cases.case.subcases.subcase');
    const submissionActivities = await this.store.query('submission-activity', {
      'filter[subcase][:id:]': subcase.id,
      'page[size]': 500,
      include: 'pieces'
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
    this.defaultAccessLevel = this.store.peekRecord('access-level', config.internRegeringAccessLevelId);
    if (!this.defaultAccessLevel) {
      const accessLevels = await this.store.query('access-level', {
        'page[size]': 1,
        'filter[:id:]': config.internRegeringAccessLevelId,
      });
      this.defaultAccessLevel = accessLevels.firstObject;
    }
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
